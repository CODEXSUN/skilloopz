export type QuizQuestionType =
  | "mcq"
  | "msq"
  | "true-false"
  | "fill-blank"
  | "matching"
  | "short-answer";

export interface QuizOption {
  id: string;
  text: string;
}

export interface ShortAnswerQuestion {
  question: string;
  correctAnswer: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  text: string;
  options?: QuizOption[];
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export interface QuizBlockConfig {
  questions: QuizQuestion[];
  passingScore: number;
  shuffle: boolean;
  showCorrectAnswers: boolean;
  maxAttempts: number;
  timeLimit?: number;
  adaptive: {
    enabled: boolean;
    difficultyLevels: ("easy" | "medium" | "hard")[];
  };
}

export interface QuizAttempt {
  blockId: string;
  score: number;
  total: number;
  answers: Record<string, unknown>;
  timeSpent: number;
  completedAt: string;
}
