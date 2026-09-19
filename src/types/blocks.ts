export type BlockType =
  | "text"
  | "video"
  | "quiz"
  | "flashcard"
  | "image"
  | "audio"
  | "embed"
  | "code"
  | "file"
  | "divider"
  | "pdf"
  | "assignment";

export interface BaseBlock {
  id: string;
  type: BlockType;
  sort_order: number;
  lesson_id: string;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: {
    markdown: string;
  };
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  content: {
    url: string;
    provider: "youtube" | "vimeo" | "direct";
    caption?: string;
    poster_url?: string;
  };
}

export interface QuizBlock extends BaseBlock {
  type: "quiz";
  content: {
    question: string;
    options: { id: string; text: string; is_correct: boolean }[];
    explanation?: string;
    allow_multiple: boolean;
  };
}

export interface FlashcardBlock extends BaseBlock {
  type: "flashcard";
  content: {
    front: string;
    back: string;
    hint?: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  content: {
    url: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

export interface AudioBlock extends BaseBlock {
  type: "audio";
  content: {
    url: string;
    transcript?: string;
    duration_seconds?: number;
  };
}

export interface EmbedBlock extends BaseBlock {
  type: "embed";
  content: {
    url: string;
    height?: number;
  };
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  content: {
    code: string;
    language: string;
  };
}

export interface FileBlock extends BaseBlock {
  type: "file";
  content: {
    url: string;
    filename: string;
    mime_type: string;
    size_bytes?: number;
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  content: Record<string, never>;
}

export interface PdfBlock extends BaseBlock {
  type: "pdf";
  content: {
    url: string;
    title?: string;
  };
}

export interface AssignmentBlock extends BaseBlock {
  type: "assignment";
  content: {
    title: string;
    instructions: string;
    maxScore: number;
    allowFileUpload: boolean;
    allowedFileTypes?: string[];
    maxFileSizeMB?: number;
    dueDate?: string;
  };
}

export type LessonBlock =
  | TextBlock
  | VideoBlock
  | QuizBlock
  | FlashcardBlock
  | ImageBlock
  | AudioBlock
  | EmbedBlock
  | CodeBlock
  | FileBlock
  | DividerBlock
  | PdfBlock
  | AssignmentBlock;
