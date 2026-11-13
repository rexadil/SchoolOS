/**
 * School Configuration Template & Multi-Level Presets
 * 
 * Supports Kindergarten (Play to Class 5), Primary (Class 1 to 5),
 * and High School (Class 6 to 10 with Science, Business Studies & Humanities groups ending at SSC).
 * Themes supported: "dawn" (warm sunrise, playful) and "campus" (collegiate navy/emerald, sharp).
 */

export type SchoolType = 'kindergarten' | 'primary' | 'highschool' | 'combined';
export type ThemePreset = 'dawn' | 'campus';

export interface SchoolLevel {
  id: string;
  name: {
    bn: string;
    en: string;
  };
  age?: {
    bn: string;
    en: string;
  };
  description?: {
    bn: string;
    en: string;
  };
  learn: {
    bn: string[];
    en: string[];
  };
  teach: {
    bn: string;
    en: string;
  };
  groups?: string[]; // e.g. ["science", "commerce", "humanities"] for Class 9 & 10
  
  // UI enrichment & backward compatibility
  gradeKey?: string;
  subtitle?: {
    bn: string;
    en: string;
  };
  lanternStage?: {
    bn: string;
    en: string;
  };
  stage?: {
    bn: string;
    en: string;
  };
  colorAccent?: string;
  activities?: {
    bn: string[];
    en: string[];
  };
  dailyRoutineSample?: {
    bn: string;
    en: string;
  };
  studentRatio?: string;
  milestoneBadge?: {
    bn: string;
    en: string;
  };
}

// Backward compatibility alias
export type SchoolClass = SchoolLevel;

export interface ApplyFieldsConfig {
  previousSchool?: boolean;
  previousResult?: boolean; // GPA / Grade
  birthRegistrationNo?: boolean; // Online Birth Reg No
  preferredGroup?: boolean; // Science / Commerce / Humanities
}

export interface SchoolMapConfig {
  shareUrl: string;
  embedUrl: string;
  lat: number;
  lng: number;
}

export interface SchoolConfig {
  type: SchoolType;
  themePreset: ThemePreset;
  eiin?: string;
  mpoStatus?: string;
  schoolCode?: string;
  registrationNo?: string;
  ownerEmail: string;
  applicationPrefix: string;
  showTemplateInspector: boolean;
  aboutParagraph: {
    bn: string;
    en: string;
  };
  map: SchoolMapConfig;
  stats: {
    studentsCount: number;
    teachersCount: number;
    yearsCount: number;
    successRate: string;
  };
  media: {
    heroVideoUrl: string;
    heroVideoTitle: { bn: string; en: string };
    virtualTourUrl: string;
    virtualTourTitle: { bn: string; en: string };
    virtualTourDescription: { bn: string; en: string };
  };
  apply: {
    fields: ApplyFieldsConfig;
  };
  meta: {
    templateVersion: string;
    reusableTemplateName: string;
  };
  brand: {
    productName: string;
    founderName: string;
    parentCompany: string;
    attribution: string;
    attributionBn: string;
    footerSignature: string;
    footerSignatureBn: string;
  };
  identity: {
    name: {
      bn: string;
      en: string;
    };
    shortName: {
      bn: string;
      en: string;
    };
    slogan: {
      bn: string;
      en: string;
    };
    conceptName: {
      bn: string;
      en: string;
    };
    establishedYear: number;
    registrationNo: string;
    schoolCode: string;
    eiin?: string;
    mpoStatus?: string;
    governingBody: {
      bn: string;
      en: string;
    };
  };
  location: {
    addressLine1: {
      bn: string;
      en: string;
    };
    area: {
      bn: string;
      en: string;
    };
    upazila: {
      bn: string;
      en: string;
    };
    district: {
      bn: string;
      en: string;
    };
    country: {
      bn: string;
      en: string;
    };
    landmark: {
      bn: string;
      en: string;
    };
    directions: {
      bn: string;
      en: string;
    };
    geoCoordinates: {
      lat: number;
      lng: number;
    };
    googleMapsEmbedUrl: string;
  };
  contact: {
    phonePrimary: string;
    phoneSecondary: string;
    whatsappNumber: string;
    email: string;
    officeHours: {
      bn: string;
      en: string;
    };
    headTeacherPhone: string;
  };
  theme: {
    bgCream: string;
    sunriseGold: string;
    sunriseCoral: string;
    leafGreen: string;
    terracotta: string;
    darkStone: string;
  };
  admission: {
    academicYear: {
      bn: string;
      en: string;
    };
    sessionStatus: {
      bn: string;
      en: string;
    };
    deadlineDate: string;
    availableSeats: number;
    requiredDocuments: {
      bn: string[];
      en: string[];
    };
    feeGuidelines: {
      admissionFee: string;
      monthlyTuitionRange: string;
      note: {
        bn: string;
        en: string;
      };
    };
  };
  dailyTimeline: Array<{
    time: {
      bn: string;
      en: string;
    };
    title: {
      bn: string;
      en: string;
    };
    description: {
      bn: string;
      en: string;
    };
    icon: string;
  }>;
  campusStats?: Array<{
    title: {
      bn: string;
      en: string;
    };
    value: string;
    subtitle: {
      bn: string;
      en: string;
    };
    icon: string;
  }>;
  teachers: Array<{
    name: {
      bn: string;
      en: string;
    };
    role: {
      bn: string;
      en: string;
    };
    qualification: {
      bn: string;
      en: string;
    };
    experience: {
      bn: string;
      en: string;
    };
    quote: {
      bn: string;
      en: string;
    };
    avatarColor: string;
  }>;
  principalMessage: {
    author: {
      bn: string;
      en: string;
    };
    title: {
      bn: string;
      en: string;
    };
    message: {
      bn: string;
      en: string;
    };
  };
  testimonials: Array<{
    parentName: {
      bn: string;
      en: string;
    };
    childGrade: {
      bn: string;
      en: string;
    };
    location: {
      bn: string;
      en: string;
    };
    feedback: {
      bn: string;
      en: string;
    };
    avatarSeed: string;
  }>;
  galleryImages: Array<{
    id: string;
    title: {
      bn: string;
      en: string;
    };
    category: 'campus' | 'classroom' | 'sports' | 'nature';
    categoryLabel: {
      bn: string;
      en: string;
    };
    imageSrc: string;
    description: {
      bn: string;
      en: string;
    };
  }>;
  levels: SchoolLevel[];
  classes: SchoolLevel[]; // backward compatibility
}

// ==========================================
// PRESET 1: KINDERGARTEN (Play to Class 5)
// ==========================================
export const kindergartenPresetLevels: SchoolLevel[] = [
  {
    id: "play",
    gradeKey: "Play",
    name: { bn: "প্লে (Play)", en: "Playgroup" },
    age: { bn: "৩ - ৪ বছর", en: "3 - 4 Years" },
    description: { bn: "প্রথম আলোর উন্মেষ: হাসি ও খেলার সূচনা", en: "The First Spark: Laughter & Playful Steps" },
    subtitle: { bn: "প্রথম আলোর উন্মেষ: হাসি ও খেলার সূচনা", en: "The First Spark: Laughter & Playful Steps" },
    lanternStage: { bn: "১ম প্রদীপ: সূচনা শিখা (Ignition)", en: "Lantern 1: The Spark of Wonder" },
    colorAccent: "var(--token-primary-500)",
    learn: {
      bn: [
        "মায়ের কোল ছেড়ে নতুন বন্ধু তৈরির আনন্দ",
        "ছড়ার তালে হাততালি ও সামাজিক আচরণ",
        "রঙিন ব্লকে রং ও আকারের প্রাথমিক ধারণা",
        "টিফিন ও পানির বোতল চেনার স্বাবলম্বন"
      ],
      en: [
        "Overcoming separation anxiety and early friendships",
        "Action rhymes and friendly greetings",
        "Color recognition and tactile shape sorting",
        "Basic self-reliance (lunchbox & bottle care)"
      ]
    },
    teach: {
      bn: "কোনো খাতা-কলমের বাধ্যবাধকতা নেই। স্নেহময় শিক্ষিকারা গান, নাচ, পুতুল নাটক ও ছবির বইয়ের মাধ্যমে স্কুলকে আনন্দের স্বর্গ বানিয়ে তোলেন।",
      en: "Zero textbook pressure. Caring educators welcome little ones with warm embraces, sensory play, and story circles."
    },
    activities: {
      bn: ["মাটির তাল মাখা", "রং ছোঁড়াছুড়ি মুক্ত অঙ্কন", "ছন্দোবদ্ধ ঘুমপাড়ানি গান", "ফলের নাম জানা"],
      en: ["Soft sensory dough", "Free-form finger painting", "Nursery rhyme action songs", "Fruit basket discovery"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:৩০ থেকে সকাল ১১:০০ টা (আড়াই ঘণ্টা)",
      en: "8:30 AM to 11:00 AM (2.5 hours)"
    },
    studentRatio: "১:১২"
  },
  {
    id: "nursery",
    gradeKey: "Nursery",
    name: { bn: "নার্সারি (Nursery)", en: "Nursery" },
    age: { bn: "৪ - ৫ বছর", en: "4 - 5 Years" },
    description: { bn: "বর্ণমালার আলো: শব্দ ও কৌতূহলের উন্মোচন", en: "Phonics & Curiosity: The Glowing Lantern" },
    subtitle: { bn: "বর্ণমালার আলো: শব্দ ও কৌতূহলের উন্মোচন", en: "Phonics & Curiosity: The Glowing Lantern" },
    lanternStage: { bn: "২য় প্রদীপ: বর্ণালোক (Alphabet Illumination)", en: "Lantern 2: Awakening Letters" },
    colorAccent: "var(--token-primary-600)",
    learn: {
      bn: [
        "বাংলা স্বরবর্ণ (অ-ঔ) ও ইংরেজি বর্ণমালার সঠিক উচ্চারণ",
        "১ থেকে ২০ পর্যন্ত সংখ্যা গণনা ও বাস্তব বস্তু মেলা",
        "খাওয়ার আগে হাত ধোয়া ও 'ধন্যবাদ' বলার শিষ্টাচার",
        "কৌতূহলী প্রশ্ন করার আত্মবিশ্বাস"
      ],
      en: [
        "Bengali vowels & English alphabet phonics",
        "Counting 1-20 with real objects",
        "Health & etiquette habits (washing hands, saying thank you)",
        "Confidence to ask curious questions"
      ]
    },
    teach: {
      bn: "স্মার্ট সাউন্ড-বোর্ড ও বালির ট্রে-তে আঙুল দিয়ে বর্ণ আঁকার মাধ্যমে খেলার ছলে স্বতঃস্ফূর্ত হাতেখড়ি।",
      en: "Phonics soundboards and sand-tracing trays allow effortless sensory alphabet mastery."
    },
    activities: {
      bn: ["বালিতে আঙুলে বর্ণ আঁকা", "কাগজের নৌকা ও প্লেন", "পাতার নকশা কুড়ানো", "গান ও আবৃত্তি"],
      en: ["Sand tray tracing", "Origami paper craft", "Foliage collection", "Choral recitation"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:৩০ থেকে সকাল ১১:৩০ টা",
      en: "8:30 AM to 11:30 AM"
    },
    studentRatio: "১:১৫"
  },
  {
    id: "kg",
    gradeKey: "KG",
    name: { bn: "কেজি (Kindergarten)", en: "Kindergarten (KG)" },
    age: { bn: "৫ - ৬ বছর", en: "5 - 6 Years" },
    description: { bn: "বাক্য ও গণিতের সোপান: যুক্তাক্ষর ও সংখ্যা মেলা", en: "Sentence Construction & Early Mathematics" },
    subtitle: { bn: "বাক্য ও গণিতের সোপান: যুক্তাক্ষর ও সংখ্যা মেলা", en: "Sentence Construction & Early Mathematics" },
    lanternStage: { bn: "৩য় প্রদীপ: বোধের আলো (Cognitive Glow)", en: "Lantern 3: Comprehension Glow" },
    colorAccent: "var(--token-success)",
    learn: {
      bn: [
        "ব্যঞ্জনবর্ণ ও সহজ ২-৩ অক্ষরের শব্দ গঠন",
        "১ থেকে ৫০ গণনা ও সহজ যোগ-বিয়োগের বাস্তব ধারণা",
        "আমাদের পরিবেশ, ঋতুচক্র ও পশুপাখির জীবন",
        "সহপাঠীদের সাহায্য করার মানবিক মূল্যবোধ"
      ],
      en: [
        "Bengali consonants, 3-letter words and sight words",
        "Numbers 1-50 with addition/subtraction using visual beads",
        "Local biodiversity and the 6 Bengali seasons",
        "Collaborative team spirit and kindness"
      ]
    },
    teach: {
      bn: "অ্যাবাকাস, রঙিন ফ্লাশকার্ড ও বাস্তব উদাহরণের সাহায্যে গণিত ও ভাষার জটিলতা দূর করা হয়।",
      en: "Abacus bead counters, illustrated flashcards, and hands-on everyday problem solving."
    },
    activities: {
      bn: ["অ্যাবাকাসে পুঁতি গণনা", "চিত্রাঙ্কন প্রতিযোগিতা", "বাগানে বীজ বোনা", "দলগত অভিনয়"],
      en: ["Abacus calculation", "Watercolor sketches", "Planting seeds", "Mini roleplay"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:৩০ থেকে দুপুর ১২:০০ টা",
      en: "8:30 AM to 12:00 PM"
    },
    studentRatio: "১:১৮"
  },
  {
    id: "class-1",
    gradeKey: "Class 1",
    name: { bn: "১ম শ্রেণি (Class 1)", en: "Class 1" },
    age: { bn: "৬ - ৭ বছর", en: "6 - 7 Years" },
    description: { bn: "প্রাথমিকের প্রারম্ভ: স্বাধীন পাঠ ও পরিবেশ পরিচয়", en: "Primary Foundation: Independent Reading" },
    subtitle: { bn: "প্রাথমিকের প্রারম্ভ: স্বাধীন পাঠ ও পরিবেশ পরিচয়", en: "Primary Foundation: Independent Reading" },
    lanternStage: { bn: "৪র্থ প্রদীপ: অনুসন্ধিৎসু শিখা (Curiosity Flame)", en: "Lantern 4: Flame of Inquiry" },
    colorAccent: "var(--token-accent)",
    learn: {
      bn: [
        "NCTB পাঠ্যপুস্তক ভিত্তিক বাংলা, ইংরেজি ও গণিত",
        "যুক্তাক্ষরের সঠিক উচ্চারণ ও সহজ অনুচ্ছেদ রিডিং",
        "প্রাথমিক বিজ্ঞান: দিন-রাত, পানির উৎস ও স্বাস্থ্যবিধি",
        "সুন্দর হাতের লেখা চর্চা ও খাতায় সুশৃঙ্খল উপস্থাপনা"
      ],
      en: [
        "National Curriculum (NCTB) aligned subjects",
        "Fluency in Bengali conjuncts and paragraph reading",
        "Elementary Science: Day/night cycle, clean water, hygiene",
        "Refined penmanship and organized notebook presentation"
      ]
    },
    teach: {
      bn: "মাল্টিমিডিয়া প্রজেক্টরে এনিমেশন ক্লাসের পাশাপাশি প্রতিটি শিশুকে আলাদা করে বোর্ডে এনে আত্মবিশ্বাস বৃদ্ধি করা হয়।",
      en: "Interactive animated lessons coupled with gentle individual presentations to build confidence."
    },
    activities: {
      bn: ["হাতের লেখা উৎসব", "স্পেলিং বি (বানান খেলা)", "বিজ্ঞানের ছোট পরীক্ষা", "মাঠের দৌড়"],
      en: ["Handwriting exhibition", "Spelling Bee", "Mini science lab", "Track races"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:০০ থেকে দুপুর ১২:৩০ টা",
      en: "8:00 AM to 12:30 PM"
    },
    studentRatio: "১:২০"
  },
  {
    id: "class-2",
    gradeKey: "Class 2",
    name: { bn: "২য় শ্রেণি (Class 2)", en: "Class 2" },
    age: { bn: "৭ - ৮ বছর", en: "7 - 8 Years" },
    description: { bn: "ভাষার গভীরতা: গল্প বলা ও যুক্তির প্রসার", en: "Language Depth: Storytelling & Logic" },
    subtitle: { bn: "ভাষার গভীরতা: গল্প বলা ও যুক্তির প্রসার", en: "Language Depth: Storytelling & Logic" },
    lanternStage: { bn: "৫ম প্রদীপ: প্রকাশের প্রদীপ (Expression Lamp)", en: "Lantern 5: Lamp of Expression" },
    colorAccent: "var(--token-primary-700)",
    learn: {
      bn: [
        "নিজের ভাষায় ছোট গল্প ও অনুভূতি গুছিয়ে লেখার দক্ষতা",
        "নামতা (১-১০), গুণ-ভাগের বাস্তব প্রয়োগ ও ঘড়ি দেখা",
        "বাংলাদেশ ও বিশ্বপরিচয়: মুক্তিযুদ্ধ ও জাতীয় বীর",
        "নৈতিক শিক্ষা ও পিতা-মাতার প্রতি দায়িত্ব"
      ],
      en: [
        "Creative paragraph writing and expressive storytelling",
        "Multiplication tables (1-10), division concepts, clock reading",
        "Bangladesh Studies: 1971 Liberation War history",
        "Moral values and respect for elders"
      ]
    },
    teach: {
      bn: "গল্প বলা ও বিতর্ক প্রতিযোগিতা, বাস্তব কাগজের ঘড়ি ঘুরিয়ে সময় শেখা এবং নিয়মিত শিক্ষামূলক কুইজ।",
      en: "Story circles, clock hands workshops, and collaborative peer learning quizzes."
    },
    activities: {
      bn: ["ঘড়ি দেখে সময় বলা", "মুক্তিযুদ্ধের গল্প বলা", "দেওয়াল পত্রিকা", "কবিতা আবৃত্তি"],
      en: ["Clock time challenge", "History storytelling", "Wall magazine", "Poetry recitation"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:০০ থেকে দুপুর ১:০০ টা",
      en: "8:00 AM to 1:00 PM"
    },
    studentRatio: "১:২২"
  },
  {
    id: "class-3",
    gradeKey: "Class 3",
    name: { bn: "৩য় শ্রেণি (Class 3)", en: "Class 3" },
    age: { bn: "৮ - ৯ বছর", en: "8 - 9 Years" },
    description: { bn: "বিজ্ঞানের অনুসন্ধান: পর্যবেক্ষণ ও পরিবেশ প্রেম", en: "Scientific Inquiry: Observation & Wonder" },
    subtitle: { bn: "বিজ্ঞানের অনুসন্ধান: পর্যবেক্ষণ ও পরিবেশ প্রেম", en: "Scientific Inquiry: Observation & Wonder" },
    lanternStage: { bn: "৬ষ্ঠ প্রদীপ: বিজ্ঞানের মশাল (Torch of Reason)", en: "Lantern 6: Torch of Reason" },
    colorAccent: "var(--token-success)",
    learn: {
      bn: [
        "প্রাথমিক বিজ্ঞান: উদ্ভিদ ও প্রাণীর জীবনচক্র, আবহাওয়া",
        "ভগ্নাংশ, পরিমাপ (মিটার, কেজি, লিটার) ও টাকা-পয়সার হিসাব",
        "Parts of Speech এর মৌলিক পরিচয় ও কথ্য ইংরেজি",
        "কম্পিউটার পরিচয়: মাউস, কীবোর্ড ও টাইপিংয়ের প্রথম দীক্ষা"
      ],
      en: [
        "Primary Science: Plant life cycles, weather instruments",
        "Fractions, measurements (kg, meter, liter), grocery math",
        "Basic English grammar (Parts of Speech) & spoken fluency",
        "Computer Literacy: Mouse handling, Bengali typing basics"
      ]
    },
    teach: {
      bn: "প্র্যাক্টিক্যাল সায়েন্স কিট, উদ্ভিদের নমুনা পর্যবেক্ষণ এবং স্কুলের কম্পিউটার ল্যাবে হাতেনাতে অনুশীলন।",
      en: "Tactile science kits, magnifying lens studies, and hands-on computer lab sessions."
    },
    activities: {
      bn: ["গাছের চারা রোপণ ডায়েরি", "কম্পিউটারে ছবি আঁকা", "বিজ্ঞানের মডেল তৈরি", "খেলাধুলা"],
      en: ["Plant observation journal", "Digital paint in PC lab", "Science model making", "Inter-house games"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:০০ থেকে দুপুর ১:১৫ টা",
      en: "8:00 AM to 1:15 PM"
    },
    studentRatio: "১:২২"
  },
  {
    id: "class-4",
    gradeKey: "Class 4",
    name: { bn: "৪র্থ শ্রেণি (Class 4)", en: "Class 4" },
    age: { bn: "৯ - ১০ বছর", en: "9 - 10 Years" },
    description: { bn: "নেতৃত্ব ও বিশ্লেষণ: সমাজ ও সমস্যা সমাধান", en: "Leadership & Logic: Social Awareness" },
    subtitle: { bn: "নেতৃত্ব ও বিশ্লেষণ: সমাজ ও সমস্যা সমাধান", en: "Leadership & Logic: Social Awareness" },
    lanternStage: { bn: "৭ম প্রদীপ: প্রজ্ঞার দ্যুতি (Radiance of Wisdom)", en: "Lantern 7: Radiance of Wisdom" },
    colorAccent: "var(--token-warning)",
    learn: {
      bn: [
        "ঐকিক নিয়ম, গ.সা.গু ও ল.সা.গু এবং জ্যামিতির রেখা ও কোণ",
        "কুড়িগ্রাম ও বাংলাদেশের নদ-নদী, ভূগোল ও সম্পদ",
        "ইংরেজি পাঠ্য থেকে অনুধাবন এবং মুক্ত রচনায় প্যারাগ্রাফ লিখন",
        "তথ্যপ্রযুক্তি: নিরাপদ ইন্টারনেট ও ডিজিটাল সতর্কতা"
      ],
      en: [
        "Unitary method, LCM & GCD, lines and geometric angles",
        "Geography of Bangladesh, river basin ecology",
        "English essay writing and unseen comprehension",
        "Safe internet usage and basic digital research"
      ]
    },
    teach: {
      bn: "গ্রুপ স্টাডি, কেস স্টাডি এবং বাস্তব সমস্যা সমাধানে শিশুদের চিন্তাশক্তি শাণিত করা হয়।",
      en: "Group study cohorts, problem-solving workshops, and interactive question bank practice."
    },
    activities: {
      bn: ["বিতর্ক প্রতিযোগিতা", "সাধারণ জ্ঞান কুইজ লীগ", "হস্তশিল্প মেলা", "স্কাউট ও কাব সমাবেশ"],
      en: ["Debate tournament", "General knowledge league", "Handicrafts showcase", "Cub Scouts drills"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:০০ থেকে দুপুর ১:৩০ টা",
      en: "8:00 AM to 1:30 PM"
    },
    studentRatio: "১:২৫"
  },
  {
    id: "class-5",
    gradeKey: "Class 5",
    name: { bn: "৫ম শ্রেণি (Class 5)", en: "Class 5 (Graduating Primary)" },
    age: { bn: "১০ - ১১ বছর", en: "10 - 11 Years" },
    description: { bn: "আলোর পূর্ণতা: প্রাথমিক সমাপনী ও ভবিষ্যৎ দিগন্ত", en: "Fullness of Light: Primary Graduation" },
    subtitle: { bn: "আলোর পূর্ণতা: প্রাথমিক সমাপনী ও ভবিষ্যৎ দিগন্ত", en: "Fullness of Light: Primary Graduation" },
    lanternStage: { bn: "৮ম প্রদীপ: পূর্ণ প্রভাত (Full Dawn of Mastery)", en: "Lantern 8: Full Dawn of Excellence" },
    colorAccent: "var(--token-danger)",
    learn: {
      bn: [
        "প্রাথমিক সমাপনী পরীক্ষার শতভাগ প্রস্তুতি ও বৃত্তি প্রস্তুতি",
        "উন্নত গণিত: শতকরা, লাভ-ক্ষতি, গড় ও ক্ষেত্রফল",
        "ইংরেজি ভাষায় সাবলীল কথন ও নির্ভুল ব্যাকরণিক প্রয়োগ",
        "কিশোর বয়সের মানসিক বিকাশ ও দায়িত্বশীল নাগরিক শপথ"
      ],
      en: [
        "Primary graduation curriculum with scholarship focus",
        "Advanced Math: Percentages, profit-loss, geometry",
        "Spoken & written English fluency and grammar precision",
        "Adolescent health orientation and leadership qualities"
      ]
    },
    teach: {
      bn: "মডেল টেস্ট, ব্যক্তিগত মেন্টরশিপ ও অতিরিক্ত বিশেষ যত্ন। প্রতিটি শিশুর ভীতি দূর করে আত্মবিশ্বাস গড়ে তোলা হয়।",
      en: "Regular mock tests, one-on-one mentor coaching, and compassionate individualized care."
    },
    activities: {
      bn: ["মডেল টেস্ট অলিম্পিয়াড", "বিদায় সংবর্ধনা ও প্রদীপ প্রজ্বলন", "বিজ্ঞান প্রকল্প প্রদর্শনী", "নেতৃত্ব ক্যাম্প"],
      en: ["Model Test Olympiad", "Graduation Lantern Ceremony", "Science Expo Projects", "Leadership Camp"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৭:৪৫ থেকে দুপুর ১:৪৫ টা (বিশেষ রিভিশনসহ)",
      en: "7:45 AM to 1:45 PM (with revision clinic)"
    },
    studentRatio: "১:২৫"
  }
];

// ==========================================
// PRESET 2: PRIMARY SCHOOL (Class 1 to 5)
// ==========================================
export const primaryPresetLevels: SchoolLevel[] = kindergartenPresetLevels.filter(
  (l) => ['class-1', 'class-2', 'class-3', 'class-4', 'class-5'].includes(l.id)
);

// ==========================================
// PRESET 3: HIGH SCHOOL (Class 6 to 10 with SSC)
// ==========================================
export const highschoolPresetLevels: SchoolLevel[] = [
  {
    id: "class-6",
    gradeKey: "Class 6",
    name: { bn: "৬ষ্ঠ শ্রেণি (Class 6)", en: "Class 6" },
    age: { bn: "১১ - ১২ বছর", en: "11 - 12 Years" },
    description: { bn: "মাধ্যমিক শিক্ষার শুভ সূচনা: উচ্চতর বিষয় পরিচয় ও শৃঙ্খলা", en: "Secondary Horizon: Foundation of Academic Rigor" },
    subtitle: { bn: "মাধ্যমিকের প্রথম সোপান", en: "First Step into Secondary Schooling" },
    lanternStage: { bn: "ধাপ ১: নতুন দিগন্তের প্রারম্ভ", en: "Milestone 1: Academic Transition" },
    colorAccent: "var(--token-accent)",
    milestoneBadge: { bn: "মাধ্যমিক সূচনা", en: "Secondary Entry" },
    learn: {
      bn: [
        "উচ্চতর গণিত ও বীজগণিতের প্রাথমিক ধারণা (বীজগণিতীয় রাশি ও সূত্র)",
        "ইংরেজি ব্যাকরণ ও দ্রুত অনুধাবন (Reading Comprehension & Dialogue)",
        "সাধারণ বিজ্ঞান: পদার্থ, রসায়ন ও জীববিদ্যার সমন্বিত ভিত্তি",
        "তথ্য ও যোগাযোগ প্রযুক্তি: কম্পিউটারের হার্ডওয়্যার, সফটওয়্যার ও অফিস টুলস"
      ],
      en: [
        "Algebraic expressions, integers, fractions and introductory geometry",
        "Applied English grammar, listening skills, and formal compositions",
        "Integrated Science: fundamentals of physics, chemistry and biology",
        "ICT: Operating systems, word processing, and internet safety"
      ]
    },
    teach: {
      bn: "বিষয়ভিত্তিক অভিজ্ঞ শিক্ষকমণ্ডলী দ্বারা ক্লাস। প্রজেক্টর ও বিজ্ঞানাগারে ব্যবহারিক প্রদর্শনের মাধ্যমে ধারণার স্পষ্টতা তৈরি করা হয়।",
      en: "Subject-matter specialist educators. Audio-visual modules and laboratory demonstrations ensure lucid conceptual clarity."
    },
    activities: {
      bn: ["গণিত উৎসব ও সুডোকু লীগ", "স্পেলিং বি ও বিতর্ক কর্মশালা", "কাব স্কাউট ও গার্ল গাইড দীক্ষা", "বিজ্ঞানাগার পরিচিতি"],
      en: ["Math Olympiad qualifiers", "Debate & Public Speaking club", "Scouts & Girl Guides drills", "Laboratory orientation"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৯:০০ থেকে দুপুর ৩:১৫ টা (৬টি বিষয়ভিত্তিক পিরিয়ড ও টিফিন বিরতি)",
      en: "9:00 AM to 3:15 PM (6 Subject Periods & Recess)"
    },
    studentRatio: "১:৩০"
  },
  {
    id: "class-7",
    gradeKey: "Class 7",
    name: { bn: "৭ম শ্রেণি (Class 7)", en: "Class 7" },
    age: { bn: "১২ - ১৩ বছর", en: "12 - 13 Years" },
    description: { bn: "যুক্তি ও অনুসন্ধিৎসা: বিজ্ঞান ও বৈশ্বিক ইতিহাস পাঠ", en: "Reason & Critical Inquiry: Global History & Science" },
    subtitle: { bn: "যুক্তির বিকাশ ও বিশ্লেষণ", en: "Development of Analytical Logic" },
    lanternStage: { bn: "ধাপ ২: যুক্তিবোধের বিস্তার", en: "Milestone 2: Depth of Analysis" },
    colorAccent: "var(--token-primary-500)",
    milestoneBadge: { bn: "যুক্তি ও বিজ্ঞান", en: "Inquiry & STEM" },
    learn: {
      bn: [
        "সরল সমীকরণ, জ্যামিতিক উপপাদ্য ও ত্রৈরাশিক নিয়মের বাস্তব প্রয়োগ",
        "বিজ্ঞান: শক্তির রূপান্তর, পরমাণুর গঠন ও উদ্ভিদের প্রজনন",
        "বাংলাদেশ ও বিশ্বপরিচয়: সংবিধান, নাগরিক অধিকার ও সার্ক দেশসমূহ",
        "সৃজনশীল সাহিত্য চর্চা ও নাট্যাভিনয়"
      ],
      en: [
        "Linear equations, geometric theorems, congruency and ratio analysis",
        "Science: Energy transformation, atomic structures and plant reproduction",
        "Social Studies: Bangladesh Constitution, citizen rights and global affairs",
        "Creative literary expression and theatrical adaptation"
      ]
    },
    teach: {
      bn: "প্র্যাক্টিক্যাল গ্রুপ প্রেজেন্টেশন এবং কুইজভিত্তিক লার্নিং যা শিক্ষার্থীদের স্বাধীনভাবে চিন্তা করতে উৎসাহিত করে।",
      en: "Collaborative peer presentations, scientific inquiry assignments, and interactive weekly quizzes."
    },
    activities: {
      bn: ["বিজ্ঞান মেলা প্রকল্প তৈরি", "আন্তঃশ্রেণি ফুটবল ও ব্যাডমিন্টন টুর্নামেন্ট", "দেওয়ালিকা প্রকাশনা", "আইসিটি প্রোগ্রামিং কর্মশালা"],
      en: ["Science Fair exhibits", "Inter-class sports league", "Literary wall-magazine", "Introductory coding bootcamp"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৯:০০ থেকে দুপুর ৩:৩০ টা",
      en: "9:00 AM to 3:30 PM"
    },
    studentRatio: "১:৩০"
  },
  {
    id: "class-8",
    gradeKey: "Class 8",
    name: { bn: "৮ম শ্রেণি (Class 8)", en: "Class 8" },
    age: { bn: "১৩ - ১৪ বছর", en: "13 - 14 Years" },
    description: { bn: "জুনিয়র পর্যায়ের শ্রেষ্ঠত্ব: বিভাগ নির্বাচনের পূর্বপ্রস্তুতি", en: "Junior Mastery: Pathway to Specialized Disciplines" },
    subtitle: { bn: "বিভাগ নির্বাচনের মোড়", en: "Gateway to Stream Specialization" },
    lanternStage: { bn: "ধাপ ৩: প্রাক-বিভাগ নির্বাচন সোপান", en: "Milestone 3: Academic Crossroads" },
    colorAccent: "var(--token-accent)",
    milestoneBadge: { bn: "জেএসসি সমমান প্রস্তুতি", en: "Junior Excellence" },
    learn: {
      bn: [
        "পাটিগণিত (মুনাফা ও পরিমাপ), বীজগণিতীয় উৎপাদক ও জ্যামিতির পিথাগোরাস উপপাদ্য",
        "উন্নত ইংরেজি ব্যাকরণ: Voice change, Narration ও আনুষ্ঠানিক পত্র লিখন",
        "বিজ্ঞান: মহাকর্ষ ও অভিকর্ষ, অম্ল-ক্ষার ও রাসায়নিক বিক্রিয়া",
        "ভবিষ্যত পেশা নির্বাচন ও ক্যারিয়ার সচেতনতা"
      ],
      en: [
        "Profit & Loss, compound interest, algebraic factorization and Pythagorean theorem",
        "Advanced English: Active/passive voice, direct/indirect narration, formal reporting",
        "General Science: Gravitation, acids-bases, and chemical bonding",
        "Career counseling, stream self-assessment (Science / Commerce / Humanities)"
      ]
    },
    teach: {
      bn: "শিক্ষার্থীদের আগ্রহ ও মেধা যাচাই করে ৯ম শ্রেণিতে সঠিক বিভাগ (বিজ্ঞান/বাণিজ্য/মানবিক) নির্বাচনের জন্য বিশেষ কাউন্সেলিং প্রদান।",
      en: "Dedicated academic counseling and diagnostic assessments to guide optimal stream selection for Class 9."
    },
    activities: {
      bn: ["ক্যারিয়ার ও বিভাগ নির্বাচন সেমিনার", "মডেল পার্লামেন্ট বিতর্ক", "বার্ষিক ক্রীড়া ও সাংস্কৃতিক সপ্তাহ", "গণিত অলিম্পিয়াড"],
      en: ["Stream Guidance Seminars", "Youth Parliament Debates", "Annual Athletic & Cultural Fest", "Math League"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:৪৫ থেকে দুপুর ৩:৪৫ টা",
      en: "8:45 AM to 3:45 PM"
    },
    studentRatio: "১:৩৫"
  },
  {
    id: "class-9",
    gradeKey: "Class 9",
    name: { bn: "৯ম শ্রেণি (Class 9)", en: "Class 9 (Stream Specialization)" },
    age: { bn: "১৪ - ১৫ বছর", en: "14 - 15 Years" },
    description: { bn: "বিভাগভিত্তিক বিশেষায়িত পাঠ: বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক", en: "Stream Specialization: Science, Commerce & Humanities" },
    subtitle: { bn: "বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখা", en: "Science, Commerce & Humanities" },
    lanternStage: { bn: "ধাপ ৪: বিশেষায়িত বিভাগের প্রদীপ্ত শিখা", en: "Milestone 4: Specialized Stream Pursuit" },
    colorAccent: "var(--token-warning)",
    groups: ["science", "commerce", "humanities"],
    milestoneBadge: { bn: "বিভাগভিত্তিক পাঠ", en: "Stream Branching" },
    learn: {
      bn: [
        "বিজ্ঞান বিভাগ: পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিত",
        "ব্যবসায় শিক্ষা বিভাগ: হিসাববিজ্ঞান, ব্যবসায় উদ্যোগ ও ফিন্যান্স ও ব্যাংকিং",
        "মানবিক বিভাগ: ভূগোল ও পরিবেশ, ইতিহাস ও পৌরনীতি",
        "বাধ্যতামূলক বাংলা ও ইংরেজি পাঠ্যক্রমের গভীর প্রস্তুতি"
      ],
      en: [
        "Science Stream: Physics, Chemistry, Biology & Higher Mathematics",
        "Commerce Stream: Accounting, Business Entrepreneurship & Finance",
        "Humanities Stream: Geography, World History, Civics & Citizenship",
        "Rigorous mastery of compulsory National Curriculum subjects"
      ]
    },
    teach: {
      bn: "প্রত্যেক বিভাগের জন্য সম্পূর্ণ পৃথক বিজ্ঞান ল্যাব, বিজনেস কেস স্টাডি ও মাল্টিমিডিয়া ভিত্তিক পাঠ্যক্রম। অভিজ্ঞ শিক্ষকমণ্ডলীর সার্বক্ষণিক মেন্টরিং।",
      en: "Well-equipped distinct Physics, Chemistry and Biology laboratories, accounting simulations, and dedicated faculty mentors."
    },
    activities: {
      bn: ["ল্যাব এক্সপেরিমেন্ট ও প্রজেক্ট প্রদর্শনী", "ব্যবসায় ধারণা ও এন্টারপ্রেনারশিপ ক্লাব", "জাতীয় বিতর্ক প্রতিযোগিতা", "রেড ক্রিসেন্ট যুব দল"],
      en: ["Hands-on STEM Lab Projects", "Young Entrepreneurs Business Pitch", "National Debate League", "Red Crescent Youth"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:৩০ থেকে বিকেল ৪:০০ টা (ব্যবহারিক ল্যাবসহ)",
      en: "8:30 AM to 4:00 PM (Including Practical Lab Work)"
    },
    studentRatio: "১:৩৫"
  },
  {
    id: "class-10",
    gradeKey: "Class 10",
    name: { bn: "১০ম শ্রেণি (Class 10 - SSC)", en: "Class 10 (SSC Candidate)" },
    age: { bn: "১৫ - ১৬ বছর", en: "15 - 16 Years" },
    description: { bn: "এস.এস.সি পরীক্ষা প্রস্তুতি ও ১০০% জিপিএ-৫ লক্ষ্যমাত্রা", en: "SSC Board Examination Mastery: 100% GPA-5 Goal" },
    subtitle: { bn: "এসএসসি সমাপনী ও ভবিষ্যৎ দিশা", en: "Secondary School Certificate (SSC) Final" },
    lanternStage: { bn: "ধাপ ৫: এস.এস.সি সাফল্যের চূড়ান্ত শিখা", en: "Milestone 5: SSC Board Exam Summit" },
    colorAccent: "var(--token-danger)",
    groups: ["science", "commerce", "humanities"],
    milestoneBadge: { bn: "এস.এস.সি চূড়ান্ত", en: "SSC Graduation" },
    learn: {
      bn: [
        "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) এর পূর্ণ সিলেবাস রিভিশন",
        "বিগত ১০ বছরের বোর্ড প্রশ্ন ও শীর্ষ স্কুলের টেস্ট পেপার সমাধান",
        "ব্যবহারিক পরীক্ষা (Practical Labs) এর নিখুঁত প্রস্তুতি ও নোটবুক",
        "পরীক্ষার ভীতি দূরীকরণ ও টাইম ম্যানেজমেন্ট কৌশল"
      ],
      en: [
        "Exhaustive syllabus revision aligned with Dinajpur Education Board standards",
        "Solving past 10 years board exams & top college test papers",
        "100% practical lab experiment mastery and notebook certification",
        "Exam psychology management and time allocation strategies"
      ]
    },
    teach: {
      bn: "পরিকল্পিত মডেল টেস্ট সিরিজ, ওএমআর শিট প্রশিক্ষণ, দুর্বল বিষয়ে সান্ধ্যকালীন বিশেষ কোচিং ও অভিভাবক সমন্বয়।",
      en: "Weekly full-length board-standard mock tests, OMR training, remedial revision clinics, and transparent parent-teacher progress audits."
    },
    activities: {
      bn: ["গ্র্যান্ড মডেল টেস্ট অলিম্পিয়াড", "এসএসসি বিদায় সংবর্ধনা ও দোয়া মাহফিল", "ক্যারিয়ার পথপ্রদর্শন কনফারেন্স", "আলোর শপথ অনুষ্ঠান"],
      en: ["Grand SSC Mock Test Series", "Valedictory Convocation & Dua Ceremony", "College & Career Pathways Summit", "Alor Shopoth Vigil"]
    },
    dailyRoutineSample: {
      bn: "সকাল ৮:০০ থেকে বিকেল ৪:৩০ টা (মডেল টেস্ট ও সান্ধ্যকালীন সলভ ক্লাস)",
      en: "8:00 AM to 4:30 PM (Intensive Mock Tests & Solve Clinics)"
    },
    studentRatio: "১:৩০"
  }
];

// Group labels for Class 9 & 10
export const highSchoolGroupOptions = [
  { id: 'science', label: { bn: 'বিজ্ঞান বিভাগ (Science)', en: 'Science Stream' } },
  { id: 'commerce', label: { bn: 'ব্যবসায় শিক্ষা (Business Studies)', en: 'Business Studies / Commerce' } },
  { id: 'humanities', label: { bn: 'মানবিক বিভাগ (Humanities)', en: 'Humanities / Arts' } },
];

// ==========================================
// CAMPUS THEME STATS (Used when theme === "campus")
// ==========================================
export const campusWhyUsStats = [
  {
    value: "১০০%",
    valueEn: "100%",
    title: { bn: "এসএসসি পাশের হার", en: "SSC Pass Rate" },
    subtitle: { bn: "ধারাবাহিক জিপিএ-৫ ও মেধাবৃত্তির অনন্য রেকর্ড", en: "Consistent GPA-5 and merit scholarship distinctions" },
    icon: "Award"
  },
  {
    value: "২৫+",
    valueEn: "25+",
    title: { bn: "অভিজ্ঞ বিষয়ভিত্তিক শিক্ষক", en: "Specialist Faculty" },
    subtitle: { bn: "পাবলিক বিশ্ববিদ্যালয় হতে উচ্চশিক্ষিত ও প্রশিক্ষিত মেন্টর", en: "Educators with Master degrees & NCTB pedagogical certifications" },
    icon: "GraduationCap"
  },
  {
    value: "৪টি",
    valueEn: "4",
    title: { bn: "আধুনিক বিজ্ঞান ও কম্পিউটার ল্যাব", en: "Modern Science & ICT Labs" },
    subtitle: { bn: "পদার্থ, রসায়ন, জীববিজ্ঞান ও দ্রুতগতির ইন্টারনেটযুক্ত আইসিটি ল্যাব", en: "Fully equipped Physics, Chemistry, Biology & High-Speed ICT facilities" },
    icon: "Microscope"
  },
  {
    value: "১০০%",
    valueEn: "100%",
    title: { bn: "ডিজিটাল ক্যাম্পাস ও সিসিটিভি", en: "Digital Campus & Security" },
    subtitle: { bn: "বায়োমেট্রিক উপস্থিতি, অভিভাবকদের এসএমএস অ্যালার্ট ও নিরাপদ প্রাঙ্গণ", en: "Biometric attendance, instant parent SMS alerts & 24/7 CCTV vigilance" },
    icon: "ShieldCheck"
  }
];

// Helper to generate default admission & monthly fee maps for any levels array
export function generateDefaultFeesForLevels(levels: SchoolLevel[]) {
  const admissionFees: Record<string, number> = {};
  const monthlyFees: Record<string, number> = {};

  levels.forEach((lvl, idx) => {
    const key = lvl.gradeKey || lvl.name.en.split(' ')[0] || lvl.id;
    // Default base fees scaling moderately with level
    admissionFees[key] = 1200 + idx * 150;
    monthlyFees[key] = 400 + idx * 60;
  });

  return { admissionFees, monthlyFees };
}

// ==========================================
// DEFAULT SCHOOL TEMPLATE INSTANCE
// ==========================================
export const defaultSchoolConfig: SchoolConfig = {
  type: "kindergarten",
  themePreset: "dawn",
  eiin: "123456",
  mpoStatus: "এমপিওভুক্ত (MPO Enlisted)",
  schoolCode: "AAKS-4509",
  registrationNo: "কুড়ি/রাজা/কেজি/২০১৬-৭৮",
  ownerEmail: "rubelahmedrex@gmail.com",
  applicationPrefix: "AAKS",
  showTemplateInspector: false,
  aboutParagraph: {
    bn: "কুড়িগ্রাম জেলার রাজারহাট উপজেলার দিনবাজারে অবস্থিত একটি আধুনিক, সংস্কৃতিবান ও ভীতিহীন প্রাক-প্রাথমিক ও প্রাথমিক বিদ্যাপিঠ। প্রতিটি শিশুর নিজস্ব আলো প্রজ্জ্বলনই আমাদের ব্রত।",
    en: "A forward-thinking, culturally rooted pre-primary and primary sanctuary at Dinbazar, Rajarhat, Kurigram. Dedicated to kindling the inner brilliance of every child."
  },
  apply: {
    fields: {
      previousSchool: true,
      previousResult: false,
      birthRegistrationNo: false,
      preferredGroup: false,
    }
  },
  meta: {
    templateVersion: "2.0.0",
    reusableTemplateName: "ASHAR ALO | আশার আলো — Modular School Engine",
  },
  brand: {
    productName: "ASHAR ALO | আশার আলো",
    founderName: "𝐑𝐄χ",
    parentCompany: "RΞX Labs",
    attribution: "Founded by 𝐑𝐄χ · An Independent Project by RΞX Labs",
    attributionBn: "প্রতিষ্ঠাতা 𝐑𝐄χ · RΞX Labs-এর একটি স্বতন্ত্র উদ্যোগ",
    footerSignature: "Designed in Bangladesh. Built for the World.",
    footerSignatureBn: "Designed in Bangladesh. Built for the World.",
  },
  identity: {
    name: {
      bn: "আশার আলো কিন্ডারগার্টেন স্কুল",
      en: "Ashar Alo Kindergarten School",
    },
    shortName: {
      bn: "আশার আলো",
      en: "Ashar Alo",
    },
    slogan: {
      bn: "প্রতিটি শিশুর ভেতরে একটি আলো আছে",
      en: "Inside every child burns a sacred light of wonder",
    },
    conceptName: {
      bn: "আলোর যাত্রা পাঠ্যক্রম",
      en: "Journey of Light Curriculum",
    },
    establishedYear: 2016,
    registrationNo: "কুড়ি/রাজা/কেজি/২০১৬-৭৮",
    schoolCode: "AAKS-4509",
    eiin: "123456",
    mpoStatus: "এমপিওভুক্ত (MPO Enlisted)",
    governingBody: {
      bn: "বাংলাদেশ প্রাথমিক শিক্ষা অধিদপ্তর ও স্থানীয় শিক্ষা ট্রাস্ট কর্তৃক স্বীকৃত",
      en: "Recognized under Local Primary Education Framework, Kurigram",
    },
  },
  location: {
    addressLine1: {
      bn: "দিনবাজার প্রধান সড়ক সংলগ্ন",
      en: "Adjacent to Dinbazar Main Road",
    },
    area: {
      bn: "দিনবাজার, ঘড়িয়ালডাঙ্গা ইউনিয়ন",
      en: "Dinbazar, Gharialdanga Union",
    },
    upazila: {
      bn: "রাজারহাট",
      en: "Rajarhat",
    },
    district: {
      bn: "কুড়িগ্রাম",
      en: "Kurigram",
    },
    country: {
      bn: "বাংলাদেশ",
      en: "Bangladesh",
    },
    landmark: {
      bn: "দিনবাজার কেন্দ্রীয় জামে মসজিদ ও ডাকঘরের ১০০ গজ পশ্চিমে",
      en: "100 yards West of Dinbazar Central Jame Mosque & Post Office",
    },
    directions: {
      bn: "রাজারহাট বাজার থেকে সিএনজি বা অটোতে মাত্র ১৫ মিনিট, কুড়িগ্রাম জেলা শহর থেকে তিস্তা রোড ধরে ২৫ মিনিটের সুগম যাতায়াত।",
      en: "Only 15 minutes by auto/CNG from Rajarhat Bazaar; 25 minutes via Teesta Road from Kurigram district town.",
    },
    geoCoordinates: {
      lat: 25.8016,
      lng: 89.5539,
    },
    googleMapsEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=89.5339%2C25.7866%2C89.5739%2C25.8166&layer=mapnik&marker=25.8016%2C89.5539",
  },
  map: {
    shareUrl: "https://maps.google.com/?q=25.8016,89.5539",
    embedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=89.5339%2C25.7866%2C89.5739%2C25.8166&layer=mapnik&marker=25.8016%2C89.5539",
    lat: 25.8016,
    lng: 89.5539,
  },
  stats: {
    studentsCount: 420,
    teachersCount: 18,
    yearsCount: 10,
    successRate: "100%",
  },
  media: {
    heroVideoUrl: "",
    heroVideoTitle: {
      bn: "আমাদের সবুজ ক্যাম্পাস ও আনন্দময় শ্রেণিকক্ষ",
      en: "Inside Our Green Campus & Joyful Classrooms",
    },
    virtualTourUrl: "",
    virtualTourTitle: {
      bn: "ভার্চুয়াল ক্যাম্পাস ভ্রমণ ও শ্রেণিকক্ষ পরিচিতি",
      en: "Virtual Campus Tour & Learning Spaces",
    },
    virtualTourDescription: {
      bn: "বাড়ি বসেই ঘুরে দেখুন আমাদের শ্রেণিকক্ষ, সবুজ খেলার মাঠ, বিজ্ঞানাগার ও সাংস্কৃতিক আয়োজন।",
      en: "Explore our sunlit classrooms, green playground, science facilities, and student celebrations from home.",
    },
  },
  contact: {
    phonePrimary: "+880 1712-345678",
    phoneSecondary: "+880 1823-987654",
    whatsappNumber: "+8801712345678",
    email: "asharalo.rajarhat@gmail.com",
    officeHours: {
      bn: "শনিবার - বৃহস্পতিবার: সকাল ৭:৩০ টা থেকে দুপুর ২:৩০ টা (শুক্রবার বন্ধ)",
      en: "Saturday - Thursday: 7:30 AM to 2:30 PM (Friday Closed)",
    },
    headTeacherPhone: "+880 1911-223344",
  },
  theme: {
    bgCream: "var(--token-surface)",
    sunriseGold: "var(--token-primary-500)",
    sunriseCoral: "var(--token-primary-600)",
    leafGreen: "var(--token-success)",
    terracotta: "var(--token-primary-700)",
    darkStone: "var(--token-ink)",
  },
  admission: {
    academicYear: {
      bn: "২০২৫-২০২৬ শিক্ষাবর্ষ",
      en: "Academic Year 2025-2026",
    },
    sessionStatus: {
      bn: "ভর্তি আবেদন চলমান (সীমিত আসন)",
      en: "Admission Open (Limited Seats)",
    },
    deadlineDate: "2026-12-31T23:59:59",
    availableSeats: 35,
    requiredDocuments: {
      bn: [
        "শিক্ষার্থীর অনলাইন জন্ম নিবন্ধন সনদের ফটোকপি",
        "শিক্ষার্থীর ২ কপি পাসপোর্ট সাইজ রঙিন ছবি",
        "পিতা ও মাতার জাতীয় পরিচয়পত্রের (NID) ফটোকপি",
        "পূর্ববর্তী স্কুলের ছাড়পত্র বা রিপোর্ট কার্ড (যদি থাকে)",
      ],
      en: [
        "Photocopy of Child's Online Birth Registration Certificate",
        "2 Passport-size Color Photographs of the Student",
        "Photocopies of Father & Mother's National ID (NID)",
        "Transfer Certificate / Report Card from previous school (if applicable)",
      ],
    },
    feeGuidelines: {
      admissionFee: "৳ ১,২০০ - ১,৮০০ (এককালীন ফরম ও কিটসহ)",
      monthlyTuitionRange: "৳ ৪০০ - ৭৫০ (শ্রেণি অনুযায়ী সাশ্রয়ী)",
      note: {
        bn: "মেধাবী ও অসচ্ছল পরিবারের শিশুদের জন্য বিশেষ বৃত্তি ও টিউশন ফি মওকুফের ব্যবস্থা রয়েছে।",
        en: "Merit scholarships and tuition waivers are available for deserving and underprivileged students.",
      },
    },
  },
  dailyTimeline: [
    {
      time: { bn: "সকাল ৮:০০ - ৮:২০", en: "08:00 AM - 08:20 AM" },
      title: { bn: "প্রভাতী সমাবেশ ও জাতীয় সংগীত", en: "Morning Assembly & National Anthem" },
      description: {
        bn: "সকালের রোদ গায়ে মেখে জাতীয় সংগীত, শপথ বাক্য পাঠ, মৃদু শারীরিক কসরত ও দিনের শুভ সূচনা।",
        en: "Under the morning sun: National anthem, student pledge, light yoga stretches, and moral thought of the day.",
      },
      icon: "Sun",
    },
    {
      time: { bn: "সকাল ৮:২০ - ১০:০০", en: "08:20 AM - 10:00 AM" },
      title: { bn: "আনন্দ পাঠ ও বর্ণমালার খেলা", en: "Joyful Literacy & Language Discovery" },
      description: {
        bn: "কাঠের ব্লক, রঙিন ছড়া ও ছবির গল্পের মাধ্যমে বাংলা ও ইংরেজির স্বতঃস্ফূর্ত হাতেখড়ি।",
        en: "Phonics, hand-painted wooden blocks, rhyming verses, and picture stories building early reading confidence.",
      },
      icon: "BookOpen",
    },
    {
      time: { bn: "সকাল ১০:০০ - ১০:৩০", en: "10:00 AM - 10:30 AM" },
      title: { bn: "পুষ্টিকর টিফিন ও আড্ডা", en: "Nutritious Snack & Friendship Time" },
      description: {
        bn: "শিক্ষক ও সহপাঠীদের সাথে হাত ধুয়ে স্বাস্থ্যসম্মত টিফিন খাওয়া ও টেবিল ম্যানার্স শেখা।",
        en: "Washing hands properly, sharing home-cooked healthy snacks, and practicing gentle dining etiquettes.",
      },
      icon: "Apple",
    },
    {
      time: { bn: "সকাল ১০:৩০ - ১২:০০", en: "10:30 AM - 12:00 PM" },
      title: { bn: "গণিত জাদু ও প্রকৃতি অনুসন্ধান", en: "Number Magic & Nature Exploration" },
      description: {
        bn: "স্কুল বাগানের পাতা গুনে যোগ-বিয়োগ, হাতে-কলমে বিজ্ঞানের প্রথম বিস্ময় ও পরিবেশ পরিচয়।",
        en: "Counting leaves in the garden for math concepts, hands-on science curiosity, and discovering local flora.",
      },
      icon: "Sparkles",
    },
    {
      time: { bn: "দুপুর ১২:০০ - ১:০০", en: "12:00 PM - 01:00 PM" },
      title: { bn: "চারুকলা, সঙ্গীত ও নাটক", en: "Creative Arts, Singing & Drama" },
      description: {
        bn: "মাটির পুতুল গড়া, জলরং দিয়ে ছবি আঁকা এবং গ্রামীণ লোকগাথা নিয়ে ছোটদের অভিনয়।",
        en: "Clay modeling, water colors, recitation, and expressing emotions through playful musical rhymes.",
      },
      icon: "Palette",
    },
    {
      time: { bn: "দুপুর ১:০০ - ১:৩০", en: "01:00 PM - 01:30 PM" },
      title: { bn: "খেলার মাঠে আনন্দ ও ছুটি", en: "Playground Games & Farewell Smiles" },
      description: {
        bn: "দোলনা, কানামাছি ও মুক্ত দৌড়ঝাঁপ শেষে শিক্ষক ও বন্ধুদের বিদায় জানিয়ে তৃপ্ত মনে বাড়ি ফেরা।",
        en: "Swings, tag games, and outdoor laughter before warm hugs from teachers and returning home safely.",
      },
      icon: "Smile",
    },
  ],
  teachers: [
    {
      name: {
        bn: "মাওলানা মো. মোজাম্মেল হক",
        en: "Md. Mozammel Haque",
      },
      role: {
        bn: "প্রতিষ্ঠাতা ও প্রধান উপদেষ্টা",
        en: "Founder & Chief Advisor",
      },
      qualification: {
        bn: "এম.এ (বাংলা), বি.এড",
        en: "M.A. (Bengali), B.Ed",
      },
      experience: {
        bn: "২৫+ বছরের শিক্ষকতার অভিজ্ঞতা",
        en: "25+ Years of Educational Leadership",
      },
      quote: {
        bn: "একটি শিশুর চোখে যে জিজ্ঞাসা থাকে, তাকে ভালোবেসে সঠিক পথে চালানোই আমাদের ব্রত।",
        en: "The pure curiosity in a child's eyes is sacred; guiding it with empathy is our lifelong mission.",
      },
      avatarColor: "from-primary-500 to-primary-700",
    },
    {
      name: {
        bn: "মোছা. নাজনীন সুলতানা (সোমা)",
        en: "Mst. Nazneen Sultana (Soma)",
      },
      role: {
        bn: "প্রধান শিক্ষিকা ও শিশু মনোবিজ্ঞান গবেষক",
        en: "Headmistress & Child Development Specialist",
      },
      qualification: {
        bn: "বি.এস.সি (অনার্স), এম.এস.সি (মনোবিজ্ঞান), ডিপ্লোমা ইন আর্লি চাইল্ডহুড",
        en: "B.Sc (Hons), M.Sc (Psychology), Dip. in Early Childhood",
      },
      experience: {
        bn: "১২ বছরের প্রি-প্রাইমারি শিক্ষাদান অভিজ্ঞতা",
        en: "12 Years in Pre-Primary Pedagogy",
      },
      quote: {
        bn: "ভয় দেখিয়ে নয়, খেলার ছলে শেখালে প্রতিটি শিশুই মেধার সর্বোচ্চ বিকাশ ঘটাতে পারে।",
        en: "Children learn effortlessly through love, music and colors—never through rote or fear.",
      },
      avatarColor: "from-success to-accent",
    },
    {
      name: {
        bn: "মো. রফিকুল ইসলাম",
        en: "Md. Rafiqul Islam",
      },
      role: {
        bn: "সহকারী শিক্ষক (গণিত ও বিজ্ঞান)",
        en: "Assistant Teacher (Math & Elementary Science)",
      },
      qualification: {
        bn: "বি.এস.সি (গণিত), রংপুর বিশ্ববিদ্যালয়",
        en: "B.Sc (Mathematics), Begum Rokeya University",
      },
      experience: {
        bn: "৮ বছরের অভিজ্ঞতা",
        en: "8 Years in Elementary STEM",
      },
      quote: {
        bn: "গণিত কোনো ভয়ের বিষয় নয়, এটি প্রকৃতির সবচেয়ে সুন্দর ছন্দ।",
        en: "Math is not a test to fear, but nature's most enchanting musical puzzle.",
      },
      avatarColor: "from-accent to-primary-700",
    },
    {
      name: {
        bn: "তাহমিনা আক্তার",
        en: "Tahmina Akhter",
      },
      role: {
        bn: "প্রাক-প্রাথমিক শিক্ষক ও চিত্রশিল্পী",
        en: "Pre-Primary Educator & Fine Arts Instructor",
      },
      qualification: {
        bn: "বি.এফ.এ (চারুকলা), বি.এ",
        en: "B.F.A (Fine Arts), B.A",
      },
      experience: {
        bn: "৬ বছরের শিশুদের চারুশিল্প পাঠদান",
        en: "6 Years Teaching Arts & Crafts",
      },
      quote: {
        bn: "রং তুলি হাতে পেলে শিশুর ভেতরের কল্পনার রঙিন দুনিয়া উন্মোচিত হয়।",
        en: "Give a child color and a brush, and they will paint a kinder, more imaginative world.",
      },
      avatarColor: "from-warning to-danger",
    },
  ],
  principalMessage: {
    author: {
      bn: "মোছা. নাজনীন সুলতানা (সোমা)",
      en: "Mst. Nazneen Sultana (Soma)",
    },
    title: {
      bn: "প্রধান শিক্ষিকার হৃদয়স্পর্শী বার্তা",
      en: "A Message from the Headmistress",
    },
    message: {
      bn: "প্রিয় অভিভাবক ও শুভানুধ্যায়ী, কুড়িগ্রামের রাজারহাটের শান্ত দিনবাজারে আমরা এমন একটি পাঠশালা গড়ে তুলতে চেয়েছি যেখানে সকালে ঘুম ভেঙে প্রতিটি শিশু হাসিমুখে স্কুলে আসার জন্য ব্যাকুল থাকবে। আমরা বিশ্বাস করি, শিশুর কাছে পড়াশোনা কোনো বোঝা নয়; এটি একটি আলোর উন্মোচন। আমাদের শিক্ষকমণ্ডলী শুধু শিক্ষক নন, প্রতিটি শিক্ষার্থীর মমতাময়ী অভিভাবক। আসুন, আপনার সন্তানকে একটি আলোকিত ভবিষ্যতের স্পর্শ এনে দিই।",
      en: "Dear parents and community members: In peaceful Dinbazar, Rajarhat, we built a school where every child wakes up thrilled to run to school with a smile. We believe learning should never be a burden, but a natural awakening of inner light. Our teachers are mentors and caring companions. Let us nurture your precious child toward a brilliant, empathetic future.",
    },
  },
  testimonials: [
    {
      parentName: {
        bn: "মো. আনিছুর রহমান",
        en: "Md. Anisur Rahman",
      },
      childGrade: {
        bn: "অর্ণব রহমান (কেজি শ্রেণির শিক্ষার্থী)",
        en: "Parent of Arnab (KG Student)",
      },
      location: {
        bn: "দিনবাজার, রাজারহাট",
        en: "Dinbazar, Rajarhat",
      },
      feedback: {
        bn: "আমার ছেলে আগে খুব লাজুক ছিল, কথা বলতে চাইত না। আশার আলো স্কুলে ভর্তি করার পর মাত্র ৬ মাসে সে স্পষ্ট করে ছড়া বলে, নিজের কাজ নিজে করে এবং স্কুলে যাওয়ার জন্য উদগ্রীব থাকে। শিক্ষকদের ভালোবাসা সত্যিই অতুলনীয়।",
        en: "My son was very shy and reserved. Within 6 months at Ashar Alo, he recites Bengali poems with immense joy and proudly packs his own bag. The warmth of the teachers is incomparable.",
      },
      avatarSeed: "anisur",
    },
    {
      parentName: {
        bn: "সুলতানা পারভীন",
        en: "Sultana Parveen",
      },
      childGrade: {
        bn: "মেহজাবিন তাসনিম (৩য় শ্রেণির শিক্ষার্থী)",
        en: "Parent of Mehzabin (Class 3)",
      },
      location: {
        bn: "ঘড়িয়ালডাঙ্গা, কুড়িগ্রাম",
        en: "Gharialdanga, Kurigram",
      },
      feedback: {
        bn: "গ্রামাঞ্চলে এমন আধুনিক ও স্নেহশীল স্কুল পেয়ে আমরা সৌভাগ্যবান। এখানে বইয়ের মুখস্থ বিদ্যা নয়, হাতে-কলমে শেখানো হয়। পরিষ্কার-পরিচ্ছন্ন পরিবেশ ও নৈতিক শিক্ষার কারণে এলাকার অভিভাবক মহলে স্কুলটি আস্থার প্রতীক।",
        en: "We are blessed to have such a progressive yet culturally rooted school in our rural region. Practical understanding and moral values take priority over rote memorization.",
      },
      avatarSeed: "sultana",
    },
    {
      parentName: {
        bn: "ডা. কামরুল হাসান",
        en: "Dr. Kamrul Hasan",
      },
      childGrade: {
        bn: "রায়ান হাসান (১ম শ্রেণি)",
        en: "Parent of Rayan (Class 1)",
      },
      location: {
        bn: "রাজারহাট সদর",
        en: "Rajarhat Sadar",
      },
      feedback: {
        bn: "স্কুলের ডিজিটাল ডিসপ্লে ক্লাসরুম ও প্রকৃতির মাঝে বাগান করার পদ্ধতিটি আমার খুব পছন্দ হয়েছে। সন্তানকে প্রকৃতির সাথে রেখে যে শিক্ষা দেওয়া হয়, তা তার সারা জীবনের মানসিক সুস্থতার বুনিয়াদ গড়ে দেয়।",
        en: "The combination of audio-visual discovery and outdoor botanical gardening builds true life skills. A model kindergarten in Kurigram district.",
      },
      avatarSeed: "kamrul",
    },
  ],
  galleryImages: [
    {
      id: "hero-school",
      title: {
        bn: "প্রভাতী রোদে আশার আলো স্কুলের সবুজ প্রাঙ্গণ",
        en: "Ashar Alo Campus at Golden Morning Dawn",
      },
      category: "campus",
      categoryLabel: {
        bn: "ক্যাম্পাস ও পরিবেশ",
        en: "Campus & Nature",
      },
      imageSrc: "/images/hero_school_sunrise.webp",
      description: {
        bn: "কুড়িগ্রামের রাজারহাটে সকালের আলোয় উদ্ভাসিত মনোরম বিদ্যালয় প্রাঙ্গণ।",
        en: "Sunlit tranquil school campus surrounded by green paddy and banyan trees in Rajarhat.",
      },
    },
    {
      id: "classroom-learning",
      title: {
        bn: "বর্ণমালা ও ছবির গল্প নিয়ে আনন্দময় প্রাক-প্রাথমিক পাঠ",
        en: "Joyful Early Phonics & Storytelling Classroom",
      },
      category: "classroom",
      categoryLabel: {
        bn: "শ্রেণিকক্ষের দৃশ্য",
        en: "Classroom Life",
      },
      imageSrc: "/images/classroom_learning.webp",
      description: {
        bn: "কাঠের ব্লক ও ছবির ছড়ায় শিক্ষিকার স্নেহময় তত্ত্বাবধানে শিশুদের পাঠদান।",
        en: "Children engaged in playful literacy with gentle, attentive guidance from teachers.",
      },
    },
    {
      id: "sports-activity",
      title: {
        bn: "বার্ষিক ক্রীড়া ও আনন্দ উৎসবে কচি-কাঁচাদের উচ্ছ্বাস",
        en: "Annual Sports Day & Joyful Sprint Fest",
      },
      category: "sports",
      categoryLabel: {
        bn: "খেলাধুলা ও উৎসব",
        en: "Sports & Celebrations",
      },
      imageSrc: "/images/sports_activity.webp",
      description: {
        bn: "সবুজ মাঠে পতাকায় সজ্জিত বার্ষিক ক্রীড়া প্রতিযোগিতা ও দলীয় দৌড়।",
        en: "Children cheering and racing with festive pennants on the green school ground.",
      },
    },
    {
      id: "nature-garden",
      title: {
        bn: "আমাদের সবুজ বন্ধু: স্কুল বাগানে শিশুদের চারা রোপণ",
        en: "Our Green Companions: Kids Gardening Experience",
      },
      category: "nature",
      categoryLabel: {
        bn: "বাগান ও পরিবেশ চর্চা",
        en: "Eco & Gardening",
      },
      imageSrc: "/images/garden_nature.webp",
      description: {
        bn: "নিজেদের হাতে ফুল ও সবজি চারায় জল ঢেলে পরিবেশ ও মাটির সাথে নিবিড় সম্পর্ক।",
        en: "Nurturing tender saplings, learning soil care and nature appreciation first-hand.",
      },
    },
  ],
  levels: kindergartenPresetLevels,
  classes: kindergartenPresetLevels,
};

// ==========================================
// PRESET CATALOG
// ==========================================
export const presets: Record<SchoolType, Partial<SchoolConfig>> = {
  kindergarten: {
    type: "kindergarten",
    themePreset: "dawn",
    eiin: "123456",
    mpoStatus: "এমপিওভুক্ত (MPO Enlisted)",
    schoolCode: "AAKS-4509",
    registrationNo: "কুড়ি/রাজা/কেজি/২০১৬-৭৮",
    apply: {
      fields: {
        previousSchool: true,
        previousResult: false,
        birthRegistrationNo: false,
        preferredGroup: false,
      }
    },
    identity: {
      ...defaultSchoolConfig.identity,
      name: { bn: "আশার আলো কিন্ডারগার্টেন স্কুল", en: "Ashar Alo Kindergarten School" },
      shortName: { bn: "আশার আলো", en: "Ashar Alo" },
      slogan: { bn: "প্রতিটি শিশুর ভেতরে একটি আলো আছে", en: "Inside every child burns a sacred light of wonder" },
      conceptName: { bn: "আলোর যাত্রা (প্লে থেকে ৫ম)", en: "Journey of Light (Play to Class 5)" },
    },
    levels: kindergartenPresetLevels,
    classes: kindergartenPresetLevels,
  },
  primary: {
    type: "primary",
    themePreset: "dawn",
    eiin: "123456",
    mpoStatus: "নন-এমপিও (Non-MPO)",
    schoolCode: "AAPS-2026",
    registrationNo: "কুড়ি/রাজা/প্রাথমিক/২০১৮-৯২",
    apply: {
      fields: {
        previousSchool: true,
        previousResult: false,
        birthRegistrationNo: false,
        preferredGroup: false,
      }
    },
    identity: {
      ...defaultSchoolConfig.identity,
      name: { bn: "আশার আলো মডেল প্রাথমিক বিদ্যালয়", en: "Ashar Alo Model Primary School" },
      shortName: { bn: "আশার আলো মডেল প্রা.বি.", en: "Ashar Alo Primary" },
      slogan: { bn: "প্রাথমিক শিক্ষার মজবুত ভিত, আলোকিত আগামীর গ্যারান্টি", en: "Solid Foundation for an Enlightened Future" },
      conceptName: { bn: "প্রাথমিক শিক্ষা যাত্রা (১ম থেকে ৫ম)", en: "Primary Education Roadmap (Class 1-5)" },
    },
    levels: primaryPresetLevels,
    classes: primaryPresetLevels,
  },
  highschool: {
    type: "highschool",
    themePreset: "campus",
    eiin: "134567",
    mpoStatus: "এমপিওভুক্ত (MPO Enlisted)",
    schoolCode: "RHS-1984",
    registrationNo: "দিনাজ/বোর্ড/উচ্চ/১৯৮৪-১২",
    apply: {
      fields: {
        previousSchool: true,
        previousResult: true,
        birthRegistrationNo: true,
        preferredGroup: true,
      }
    },
    identity: {
      ...defaultSchoolConfig.identity,
      name: { bn: "আশার আলো আদর্শ উচ্চ বিদ্যালয়", en: "Ashar Alo Model High School" },
      shortName: { bn: "আশার আলো হাই স্কুল", en: "Ashar Alo High School" },
      slogan: { bn: "জ্ঞানের আলো ও আধুনিক বিজ্ঞান চর্চায় ভবিষ্যৎ বিনির্মাণ", en: "Fostering Tomorrow through Science, Integrity & Excellence" },
      conceptName: { bn: "মাধ্যমিক শিক্ষা ও এসএসসি সোপান (৬ষ্ঠ - ১০ম)", en: "Secondary Academic Road to SSC (Class 6-10)" },
    },
    levels: highschoolPresetLevels,
    classes: highschoolPresetLevels,
  },
  combined: {
    type: "combined",
    themePreset: "campus",
    eiin: "134567",
    mpoStatus: "এমপিওভুক্ত (MPO Enlisted)",
    schoolCode: "AAKS-COMB",
    registrationNo: "কুড়ি/সমন্বিত/২০২০-০১",
    apply: {
      fields: {
        previousSchool: true,
        previousResult: true,
        birthRegistrationNo: true,
        preferredGroup: true,
      }
    },
    identity: {
      ...defaultSchoolConfig.identity,
      name: { bn: "আশার আলো স্কুল অ্যান্ড কলেজ", en: "Ashar Alo School & College" },
      shortName: { bn: "আশার আলো কলেজ", en: "Ashar Alo College" },
      slogan: { bn: "প্লে থেকে এসএসসি: এক ছাদের নিচে পূর্ণাঙ্গ আলোর যাত্রা", en: "From Play to SSC: Complete Journey of Excellence" },
      conceptName: { bn: "সমন্বিত শিক্ষাক্রম (প্লে থেকে ১০ম)", en: "Combined Curriculum (Play to Class 10)" },
    },
    levels: [...kindergartenPresetLevels, ...highschoolPresetLevels],
    classes: [...kindergartenPresetLevels, ...highschoolPresetLevels],
  }
};

/**
 * Returns the effective school config, taking into account window.SCHOOL (if injected)
 * or any stored user preset preference.
 */
export function getActiveSchoolConfig(): SchoolConfig {
  let active: SchoolConfig = { ...defaultSchoolConfig };

  if (typeof window !== 'undefined') {
    // 1. Check if user selected a preset in localStorage
    const savedPreset = localStorage.getItem('school_active_preset') as SchoolType | null;
    if (savedPreset && presets[savedPreset]) {
      const presetData = presets[savedPreset];
      active = {
        ...active,
        ...presetData,
        identity: { ...active.identity, ...(presetData.identity || {}) },
        map: { ...active.map, ...(presetData.map || {}) },
        apply: { ...active.apply, ...(presetData.apply || {}) },
        levels: (presetData.levels || active.levels) as SchoolLevel[],
        classes: (presetData.classes || active.classes) as SchoolLevel[],
      };
      return active;
    }

    // 2. Check window.SCHOOL
    const globalSchool = (window as any).SCHOOL;
    if (globalSchool) {
      const gType = (globalSchool.type as SchoolType) || 'kindergarten';
      const presetData = presets[gType] || presets.kindergarten;

      active = {
        ...active,
        type: gType,
        themePreset: (globalSchool.theme as ThemePreset) || presetData.themePreset || 'dawn',
        eiin: globalSchool.eiin ?? presetData.eiin,
        mpoStatus: globalSchool.mpoStatus ?? presetData.mpoStatus,
        schoolCode: globalSchool.schoolCode ?? presetData.schoolCode,
        registrationNo: globalSchool.registrationNo ?? presetData.registrationNo,
        ownerEmail: (globalSchool as any).ownerEmail ?? presetData.ownerEmail ?? active.ownerEmail,
        applicationPrefix: (globalSchool as any).applicationPrefix ?? presetData.applicationPrefix ?? active.applicationPrefix,
        showTemplateInspector: (globalSchool as any).showTemplateInspector ?? presetData.showTemplateInspector ?? active.showTemplateInspector,
        aboutParagraph: (globalSchool as any).aboutParagraph ?? presetData.aboutParagraph ?? active.aboutParagraph,
        map: {
          ...active.map,
          ...(presetData.map || {}),
          ...((globalSchool as any).map || {}),
        },
        stats: {
          ...active.stats,
          ...(presetData.stats || {}),
          ...((globalSchool as any).stats || {}),
        },
        media: {
          ...active.media,
          ...(presetData.media || {}),
          ...((globalSchool as any).media || {}),
        },
        apply: {
          fields: {
            ...presetData.apply?.fields,
            ...(globalSchool.apply?.fields || {}),
          }
        },
        levels: globalSchool.levels && Array.isArray(globalSchool.levels) && globalSchool.levels.length > 0
          ? globalSchool.levels.map((lvl: any, idx: number) => ({
              ...lvl,
              id: lvl.id || `lvl-${idx}`,
              gradeKey: lvl.gradeKey || lvl.name?.en?.split(' ')[0] || lvl.id,
              subtitle: lvl.subtitle || lvl.description,
              lanternStage: lvl.lanternStage || { bn: `ধাপ ${idx + 1}`, en: `Step ${idx + 1}` },
              colorAccent: lvl.colorAccent || 'var(--token-primary-500)',
              activities: lvl.activities || { bn: ['শ্রেণিভিত্তিক কাজ'], en: ['Classroom Activity'] },
              dailyRoutineSample: lvl.dailyRoutineSample || { bn: 'সকাল ৮:৩০ - দুপুর ১:০০', en: '8:30 AM - 1:00 PM' },
              studentRatio: lvl.studentRatio || '১:২৫'
            }))
          : (presetData.levels as SchoolLevel[]),
      };
      active.classes = active.levels;
    }
  }

  return active;
}

export const schoolConfig: SchoolConfig = getActiveSchoolConfig();
