import type { MarketingProgram } from "@/types/program";

export const programCategories = [
  "Popular Program",
  "Skill Development Program",
  "IBM Program",
  "Competitive Exam",
  "Professional Programs",
];

type ProgramDefinition = Pick<
  MarketingProgram,
  | "slug"
  | "title"
  | "category"
  | "programGroups"
  | "eyebrow"
  | "description"
  | "about"
  | "duration"
  | "deliveryMode"
  | "accent"
  | "coverImage"
  | "coverAlt"
  | "learningOutcomes"
  | "tools"
  | "idealFor"
  | "careerOpportunities"
>;

const definitions: ProgramDefinition[] = [
  {
    slug: "full-stack-web-development",
    title: "Full Stack Web Development",
    category: "Technology",
    programGroups: [
      "Popular Program",
      "Skill Development Program",
      "IBM Program",
    ],
    eyebrow: "BUILD COMPLETE PRODUCTS",
    description:
      "Build complete web applications using front-end, back-end, databases, and APIs for seamless digital experiences.",
    about:
      "Learn the practical workflow behind modern web products. You will build interfaces, APIs, data models, and a capstone application that you can present with confidence.",
    duration: "6 months",
    deliveryMode: "Live online + labs",
    accent: "from-fuchsia-500 via-violet-600 to-indigo-700",
    coverImage: "/images/programs/full-stack-development.webp",
    coverAlt:
      "Abstract full-stack system connecting interfaces, services, databases, and cloud infrastructure",
    learningOutcomes: [
      "Responsive user interfaces",
      "Server-side APIs",
      "Database design",
      "Authentication flows",
      "Testing workflows",
      "Deployment basics",
    ],
    tools: [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "GitHub",
      "VS Code",
    ],
    idealFor: [
      "Students starting a software career",
      "Career switchers",
      "Developers who want end-to-end skills",
    ],
    careerOpportunities: [
      "Full Stack Developer",
      "Front-End Developer",
      "Back-End Developer",
      "Web Application Developer",
    ],
  },
  {
    slug: "ai-and-ml",
    title: "AI & ML",
    category: "Technology",
    programGroups: ["Popular Program", "IBM Program", "Professional Programs"],
    eyebrow: "BUILD INTELLIGENT SYSTEMS",
    description:
      "Develop smart systems that learn, adapt, and make decisions using algorithms and data patterns.",
    about:
      "Build a foundation in machine learning through guided experiments, model evaluation, and hands-on applications that solve clear business and product problems.",
    duration: "6 months",
    deliveryMode: "Live online + labs",
    accent: "from-indigo-500 via-blue-600 to-cyan-700",
    coverImage: "/images/programs/generative-ai.webp",
    coverAlt:
      "A generative AI workflow transforming structured inputs into model outputs",
    learningOutcomes: [
      "Python for machine learning",
      "Model training",
      "Data preparation",
      "Evaluation metrics",
      "Responsible AI",
      "Applied AI projects",
    ],
    tools: ["Python", "Jupyter", "scikit-learn", "Pandas", "Git", "Power BI"],
    idealFor: [
      "Students interested in AI",
      "Analysts moving into machine learning",
      "Engineers who want applied AI skills",
    ],
    careerOpportunities: [
      "Machine Learning Engineer",
      "AI Engineer",
      "Data Scientist",
      "AI Product Analyst",
    ],
  },
  {
    slug: "data-science",
    title: "Data Science",
    category: "Analytics",
    programGroups: ["Popular Program", "IBM Program", "Professional Programs"],
    eyebrow: "TURN DATA INTO INSIGHT",
    description:
      "Extract insights from complex data using statistical analysis, machine learning, and data visualization techniques.",
    about:
      "Work through the full data-science process from question framing and clean data to models, dashboards, and decision-ready storytelling.",
    duration: "6 months",
    deliveryMode: "Live online + labs",
    accent: "from-cyan-500 via-blue-600 to-indigo-800",
    coverImage: "/images/programs/data-science-ai.webp",
    coverAlt:
      "Data flowing through an analytical model into charts and predictions",
    learningOutcomes: [
      "Statistical analysis",
      "SQL queries",
      "Data cleaning",
      "Predictive modeling",
      "Data visualization",
      "Insight storytelling",
    ],
    tools: ["Python", "SQL", "Pandas", "scikit-learn", "Power BI", "Jupyter"],
    idealFor: [
      "Graduates who enjoy data",
      "Analysts who want deeper modeling skills",
      "Professionals who make data-driven decisions",
    ],
    careerOpportunities: [
      "Data Scientist",
      "Business Intelligence Analyst",
      "Data Engineer",
      "Research Analyst",
    ],
  },
  {
    slug: "data-analysis",
    title: "Data Analysis",
    category: "Analytics",
    programGroups: ["Popular Program", "IBM Program", "Competitive Exam"],
    eyebrow: "MAKE DATA USEFUL",
    description:
      "Analyze raw data to find trends, make decisions, and improve business outcomes effectively.",
    about:
      "Learn how analysts turn business questions into useful dashboards, reports, and recommendations through structured data work and clear communication.",
    duration: "4 months",
    deliveryMode: "Live online + labs",
    accent: "from-sky-500 via-cyan-600 to-teal-800",
    coverImage: "/images/programs/data-science-ai.webp",
    coverAlt: "Analytical dashboards and patterns created from business data",
    learningOutcomes: [
      "Spreadsheet analysis",
      "SQL fundamentals",
      "Dashboard design",
      "Trend analysis",
      "Business reporting",
      "Data quality checks",
    ],
    tools: ["Excel", "SQL", "Power BI", "Tableau", "Python", "Google Sheets"],
    idealFor: [
      "Beginners entering analytics",
      "Business professionals",
      "Students preparing for analyst roles",
    ],
    careerOpportunities: [
      "Data Analyst",
      "Business Analyst",
      "Reporting Analyst",
      "Operations Analyst",
    ],
  },
  {
    slug: "vlsi",
    title: "VLSI",
    category: "Engineering",
    programGroups: [
      "Popular Program",
      "Skill Development Program",
      "Competitive Exam",
    ],
    eyebrow: "DESIGN ELECTRONIC SYSTEMS",
    description:
      "Design and develop integrated circuits for electronics using advanced semiconductor technology and digital logic.",
    about:
      "Build practical knowledge of digital logic, semiconductor fundamentals, and the VLSI design flow through structured labs and engineering case studies.",
    duration: "5 months",
    deliveryMode: "Live online + simulation labs",
    accent: "from-orange-400 via-amber-600 to-rose-800",
    coverImage: "/images/programs/cloud-computing.webp",
    coverAlt: "Connected digital systems and electronic engineering components",
    learningOutcomes: [
      "Digital logic",
      "Verilog fundamentals",
      "Semiconductor basics",
      "Circuit simulation",
      "VLSI design flow",
      "Verification concepts",
    ],
    tools: [
      "Verilog",
      "ModelSim",
      "Xilinx",
      "Cadence concepts",
      "Linux",
      "Git",
    ],
    idealFor: [
      "Electronics students",
      "Engineering graduates",
      "Learners preparing for semiconductor roles",
    ],
    careerOpportunities: [
      "VLSI Design Engineer",
      "Verification Engineer",
      "ASIC Engineer",
      "Embedded Systems Engineer",
    ],
  },
  {
    slug: "medical-coding",
    title: "Medical Coding",
    category: "Healthcare",
    programGroups: [
      "Popular Program",
      "Skill Development Program",
      "Competitive Exam",
    ],
    eyebrow: "CODE HEALTHCARE ACCURATELY",
    description:
      "Translate healthcare services into standardized codes for billing and health record management.",
    about:
      "Learn the coding standards, clinical documentation workflow, and accuracy checks used to support healthcare records and billing operations.",
    duration: "4 months",
    deliveryMode: "Live online + guided practice",
    accent: "from-rose-400 via-pink-600 to-fuchsia-800",
    coverImage: "/images/programs/product-management.webp",
    coverAlt: "Organized health records and digital clinical workflows",
    learningOutcomes: [
      "Medical terminology",
      "ICD coding principles",
      "Clinical documentation",
      "Billing workflow",
      "Compliance basics",
      "Accuracy review",
    ],
    tools: [
      "ICD-10-CM",
      "CPT concepts",
      "EHR workflows",
      "Medical dictionaries",
      "Excel",
      "Documentation templates",
    ],
    idealFor: [
      "Healthcare graduates",
      "Life-science students",
      "Professionals entering medical administration",
    ],
    careerOpportunities: [
      "Medical Coder",
      "Clinical Coding Specialist",
      "Medical Billing Specialist",
      "Health Information Technician",
    ],
  },
  {
    slug: "hybrid-electric-vehicles",
    title: "HEV — Hybrid Electric Vehicles",
    category: "Automotive",
    programGroups: [
      "Popular Program",
      "Skill Development Program",
      "Professional Programs",
    ],
    eyebrow: "ENGINEER THE FUTURE OF MOBILITY",
    description:
      "Learn hybrid vehicle design, battery systems, and motor control for future-focused automotive engineering.",
    about:
      "Explore the systems that power hybrid vehicles, from energy storage and motor control to diagnostics, safety, and sustainable mobility design.",
    duration: "5 months",
    deliveryMode: "Live online + engineering labs",
    accent: "from-emerald-400 via-teal-600 to-cyan-800",
    coverImage: "/images/programs/cloud-computing.webp",
    coverAlt:
      "Connected technology representing future-focused automotive engineering",
    learningOutcomes: [
      "HEV architecture",
      "Battery management",
      "Motor control",
      "Power electronics",
      "Vehicle diagnostics",
      "Safety systems",
    ],
    tools: [
      "MATLAB concepts",
      "Simulink concepts",
      "CAN tools",
      "Battery analysis",
      "Diagnostic tools",
      "Engineering drawings",
    ],
    idealFor: [
      "Automotive students",
      "Mechanical and electrical engineers",
      "Learners interested in EV technology",
    ],
    careerOpportunities: [
      "EV Systems Engineer",
      "Battery Engineer",
      "Automotive Technician",
      "Powertrain Engineer",
    ],
  },
  {
    slug: "biotech-medical-program",
    title: "Bio-Tech & Medical Program",
    category: "Life Sciences",
    programGroups: ["Popular Program", "Professional Programs"],
    eyebrow: "CONNECT SCIENCE AND HEALTHCARE",
    description:
      "Covers biotechnology techniques, medical equipment handling, and healthcare technology fundamentals for life sciences careers.",
    about:
      "Develop foundational laboratory, medical-technology, and healthcare-process knowledge with guided practice focused on safe, accurate professional work.",
    duration: "5 months",
    deliveryMode: "Live online + practical labs",
    accent: "from-violet-500 via-fuchsia-600 to-rose-700",
    coverImage: "/images/programs/ui-ux-design.webp",
    coverAlt: "Structured scientific tools and biomedical technology concepts",
    learningOutcomes: [
      "Biotechnology methods",
      "Lab safety",
      "Medical equipment basics",
      "Healthcare technology",
      "Quality procedures",
      "Scientific documentation",
    ],
    tools: [
      "Lab protocols",
      "Medical equipment guides",
      "Documentation templates",
      "Microscopy concepts",
      "Quality checklists",
      "Data tools",
    ],
    idealFor: [
      "Life-science students",
      "Healthcare graduates",
      "Learners entering biotechnology roles",
    ],
    careerOpportunities: [
      "Laboratory Technician",
      "Biomedical Technician",
      "Clinical Research Assistant",
      "Healthcare Technology Specialist",
    ],
  },
];

export const marketingPrograms: MarketingProgram[] =
  definitions.map(createProgram);

export function getMarketingProgram(
  slug: string,
): MarketingProgram | undefined {
  return marketingPrograms.find((program) => program.slug === slug);
}

function createProgram(definition: ProgramDefinition): MarketingProgram {
  const curriculum = [
    "Foundations",
    "Core skills",
    "Applied practice",
    "Professional workflow",
    "Capstone project",
  ].map((title, index) => ({
    title: `Module ${String(index + 1).padStart(2, "0")} — ${title}`,
    summary: `Build practical ${definition.title.toLowerCase()} knowledge through guided lessons and review.`,
    lessons: [
      `${title} concepts`,
      "Guided exercises",
      "Real-world case study",
      "Knowledge check",
    ],
  }));
  return {
    ...definition,
    level: "Beginner & Intermediate",
    students: "12,000+",
    rating: "4.9",
    price: "₹15,999",
    modules: "5 modules",
    projects: "4 projects",
    curriculum,
    requirements: [
      "No specialist experience is required",
      "A laptop and reliable internet connection",
      "Curiosity and consistent study time",
    ],
    materials: [
      "Guided lessons and practice",
      "Project briefs",
      "Mentor feedback",
      "Career preparation resources",
    ],
    benefits: [
      "Practical projects",
      "Program certificate",
      "Mentor guidance",
      "Career preparation",
    ],
    mentor: {
      name: "ABHI Learning Team",
      role: "Industry instructors",
      initials: "AL",
    },
    faqs: buildFaqs(definition.title, definition.duration),
  };
}

function buildFaqs(subject: string, duration: string) {
  return [
    {
      question: `Do I need prior ${subject} experience?`,
      answer:
        "No specialist experience is required. The first module builds the foundation needed for the remaining work.",
    },
    {
      question: "How is the program delivered?",
      answer:
        "You learn through concise lessons, guided practice, mentor review, and practical projects.",
    },
    {
      question: "How long do I retain access?",
      answer: `The guided program runs for ${duration}, and you keep access to the core learning resources.`,
    },
  ];
}
