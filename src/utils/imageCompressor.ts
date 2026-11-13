/**
 * Browser-side Image Compression Utility
 * Resizes large image files (up to 12MB) to a constrained dimension
 * and converts to compressed JPEG base64 strings for direct Firestore persistence.
 */

export interface CompressionOptions {
  maxDimension?: number; // max width or height in px (e.g. 480 for avatar, 1280 for gallery)
  quality?: number; // 0.1 to 1.0 (default 0.78)
  maxBytes?: number; // target max byte size in bytes (e.g. 150 * 1024)
}

export function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxDimension = 480,
    quality = 0.78,
    maxBytes = 190 * 1024,
  } = options;

  const hardLimit = Math.min(maxBytes, 200 * 1024);

  return new Promise((resolve, reject) => {
    // Basic file guard: up to 12MB accepted
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('ফাইল সাইজ ১২ মেগাবাইটের বেশি হতে পারবে না (File exceeds 12MB)'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ছবি পড়তে সমস্যা হয়েছে (Failed to read image file)'));
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('ছবির ফরম্যাট সমর্থন করে না (Invalid image file)'));
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-preserving dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const renderAtSize = (targetW: number, targetH: number, q: number): string => {
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('ক্যানভাস তৈরি করা যায়নি (Canvas context unavailable)');
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = 'rgb(255, 255, 255)';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          return canvas.toDataURL('image/jpeg', q);
        };

        try {
          let currentQuality = quality;
          let dataUrl = renderAtSize(width, height, currentQuality);
          let estimatedBytes = Math.round((dataUrl.length * 3) / 4);

          // Step down JPEG quality first
          while (estimatedBytes > hardLimit && currentQuality > 0.35) {
            currentQuality = Math.max(0.35, Number((currentQuality - 0.1).toFixed(2)));
            dataUrl = renderAtSize(width, height, currentQuality);
            estimatedBytes = Math.round((dataUrl.length * 3) / 4);
            if (currentQuality === 0.35) break;
          }

          // If still above hardLimit, step down dimensions by 20%
          let currentW = width;
          let currentH = height;
          while (estimatedBytes > hardLimit && currentW > 180 && currentH > 180) {
            currentW = Math.round(currentW * 0.8);
            currentH = Math.round(currentH * 0.8);
            dataUrl = renderAtSize(currentW, currentH, 0.6);
            estimatedBytes = Math.round((dataUrl.length * 3) / 4);
          }

          resolve(dataUrl);
        } catch (renderErr) {
          reject(renderErr);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
