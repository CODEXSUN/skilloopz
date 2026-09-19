export interface BlockFieldDef {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface BlockDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: BlockFieldDef[];
}

export const blockDefinitions: BlockDefinition[] = [
  {
    id: "text",
    name: "Text",
    description: "Markdown-formatted text content",
    icon: "FileText",
    fields: [
      { key: "markdown", label: "Markdown Content", type: "markdown", required: true },
    ],
  },
  {
    id: "video",
    name: "Video",
    description: "YouTube, Vimeo, or direct video URL",
    icon: "Video",
    fields: [
      { key: "url", label: "Video URL", type: "url", required: true },
      {
        key: "provider",
        label: "Provider",
        type: "select",
        required: true,
        options: [
          { value: "youtube", label: "YouTube" },
          { value: "vimeo", label: "Vimeo" },
          { value: "direct", label: "Direct URL" },
        ],
      },
      { key: "caption", label: "Caption", type: "text", required: false },
      { key: "poster_url", label: "Poster Image URL", type: "url", required: false },
    ],
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Multiple choice, multiple select, and other question types",
    icon: "HelpCircle",
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "allow_multiple", label: "Allow Multiple Answers", type: "boolean", required: false },
      { key: "explanation", label: "Explanation", type: "textarea", required: false },
    ],
  },
  {
    id: "flashcard",
    name: "Flashcard",
    description: "Front/back flashcard with optional hint",
    icon: "Copy",
    fields: [
      { key: "front", label: "Front Content", type: "textarea", required: true },
      { key: "back", label: "Back Content", type: "textarea", required: true },
      { key: "hint", label: "Hint", type: "text", required: false },
    ],
  },
  {
    id: "image",
    name: "Image",
    description: "Single image with alt text",
    icon: "Image",
    fields: [
      { key: "url", label: "Image URL", type: "url", required: true },
      { key: "alt", label: "Alt Text", type: "text", required: true },
      { key: "caption", label: "Caption", type: "text", required: false },
      { key: "width", label: "Width (px)", type: "number", required: false },
      { key: "height", label: "Height (px)", type: "number", required: false },
    ],
  },
  {
    id: "audio",
    name: "Audio",
    description: "Audio file or embed URL",
    icon: "Headphones",
    fields: [
      { key: "url", label: "Audio URL", type: "url", required: true },
      { key: "transcript", label: "Transcript", type: "textarea", required: false },
      { key: "duration_seconds", label: "Duration (seconds)", type: "number", required: false },
    ],
  },
  {
    id: "embed",
    name: "Embed",
    description: "External embed (iframe, widget)",
    icon: "Code",
    fields: [
      { key: "url", label: "Embed URL", type: "url", required: true },
      { key: "height", label: "Height (px)", type: "number", required: false },
    ],
  },
  {
    id: "code",
    name: "Code",
    description: "Syntax-highlighted code snippet",
    icon: "Terminal",
    fields: [
      { key: "code", label: "Code", type: "code", required: true },
      { key: "language", label: "Language", type: "text", required: true },
    ],
  },
  {
    id: "file",
    name: "File",
    description: "Downloadable file attachment",
    icon: "Paperclip",
    fields: [
      { key: "url", label: "File URL", type: "url", required: true },
      { key: "filename", label: "Filename", type: "text", required: true },
      { key: "mime_type", label: "MIME Type", type: "text", required: true },
      { key: "size_bytes", label: "File Size (bytes)", type: "number", required: false },
    ],
  },
  {
    id: "divider",
    name: "Divider",
    description: "Horizontal rule / separator",
    icon: "Minus",
    fields: [],
  },
  {
    id: "assignment",
    name: "Assignment",
    description: "Student submission with teacher grading",
    icon: "FileCheck",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "instructions", label: "Instructions", type: "textarea", required: true },
      { key: "maxScore", label: "Max Score", type: "number", required: false },
      { key: "allowFileUpload", label: "Allow File Upload", type: "boolean", required: false },
      { key: "maxFileSizeMB", label: "Max File Size (MB)", type: "number", required: false },
    ],
  },
];
