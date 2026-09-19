export interface ProgramCurriculumModule {
  title: string;
  summary: string;
  lessons: string[];
}

export interface ProgramFaq {
  question: string;
  answer: string;
}

export interface ProgramMentor {
  name: string;
  role: string;
  initials: string;
}

export interface MarketingProgram {
  slug: string;
  title: string;
  category: string;
  programGroups: string[];
  eyebrow: string;
  description: string;
  about: string;
  duration: string;
  deliveryMode: string;
  level: string;
  students: string;
  rating: string;
  price: string;
  modules: string;
  projects: string;
  accent: string;
  coverImage: string;
  coverAlt: string;
  learningOutcomes: string[];
  curriculum: ProgramCurriculumModule[];
  requirements: string[];
  materials: string[];
  tools: string[];
  benefits: string[];
  idealFor: string[];
  careerOpportunities: string[];
  mentor: ProgramMentor;
  faqs: ProgramFaq[];
}
