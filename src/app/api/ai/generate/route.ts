import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runSafetyCheck, sanitizeAIResponse } from "@/lib/ai-safety";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const AI_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const current = AI_RATE_LIMIT.get(userId);

  if (!current || now > current.resetAt) {
    AI_RATE_LIMIT.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  current.count++;
  return true;
}

const generateSchema = z.object({
  type: z.enum(["quiz", "practice", "summary", "improvements", "lesson"]),
  content: z.string().min(10),
  options: z.object({
    questionCount: z.number().int().min(1).max(20).default(5),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    questionTypes: z.array(z.enum(["mcq", "truefalse", "fillblank", "shortanswer"])).default(["mcq"]),
    subject: z.string().optional(),
    gradeLevel: z.string().optional(),
  }).optional(),
});

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  const teacher = await prisma.profile.findUnique({
    where: { id: userId, role: "teacher" },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { type, content, options } = parsed.data;

  const safetyCheck = runSafetyCheck(content);
  if (!safetyCheck.passed) {
    return NextResponse.json(
      { error: "Content failed safety check", issues: safetyCheck.issues },
      { status: 400 },
    );
  }

  const prompt = getPrompt(type, safetyCheck.sanitizedContent, options);

  if (!OPENAI_API_KEY) {
    const fallback = getFallbackResponse(type, content, options);
    return NextResponse.json(fallback);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are an expert educational content generator. Generate high-quality, age-appropriate content. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "{}";
    const sanitizedContent = sanitizeAIResponse(rawContent);
    const generated = JSON.parse(sanitizedContent);

    return NextResponse.json(generated);
  } catch {
    const fallback = getFallbackResponse(type, content, options);
    return NextResponse.json(fallback);
  }
}

function getPrompt(
  type: string,
  content: string,
  options?: {
    questionCount?: number;
    difficulty?: string;
    questionTypes?: string[];
    subject?: string;
    gradeLevel?: string;
  },
): string {
  const count = options?.questionCount ?? 5;
  const difficulty = options?.difficulty ?? "intermediate";
  const types = options?.questionTypes ?? ["mcq"];
  const subject = options?.subject ?? "general";
  const grade = options?.gradeLevel ?? "middle school";

  switch (type) {
    case "quiz":
      return `Generate ${count} ${difficulty}-level quiz questions based on the following content. Use these question types: ${types.join(", ")}. Subject: ${subject}. Grade level: ${grade}.

Content:
${content}

Respond with JSON in this format:
{
  "questions": [
    {
      "type": "mcq" | "truefalse" | "fillblank" | "shortanswer",
      "question": "The question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}`;

    case "practice":
      return `Generate ${count} practice problems based on the following content. Difficulty: ${difficulty}. Subject: ${subject}. Grade level: ${grade}.

Content:
${content}

Respond with JSON:
{
  "problems": [
    {
      "problem": "The practice problem",
      "hint": "A helpful hint",
      "solution": "The step-by-step solution",
      "difficulty": "${difficulty}"
    }
  ]
}`;

    case "summary":
      return `Summarize the following content for a ${grade} student. Keep it clear and concise.

Content:
${content}

Respond with JSON:
{
  "summary": "A 2-3 paragraph summary",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "vocabulary": [{"term": "term", "definition": "definition"}]
}`;

    case "improvements":
      return `Analyze the following lesson content and suggest improvements for clarity, engagement, and learning effectiveness.

Content:
${content}

Respond with JSON:
{
  "strengths": ["Strength 1", "Strength 2"],
  "suggestions": [{"area": "area", "suggestion": "specific suggestion"}],
  "additionalTopics": ["Topic that could be added"],
  "engagementIdeas": ["Idea to make it more engaging"]
}`;

    case "lesson":
      return `Create a complete lesson outline based on the following topic. Difficulty: ${difficulty}. Grade level: ${grade}.

Topic/Content:
${content}

Respond with JSON:
{
  "title": "Lesson title",
  "objectives": ["Learning objective 1", "Learning objective 2"],
  "sections": [
    {
      "type": "text" | "video" | "quiz" | "interactive",
      "title": "Section title",
      "content": "Section content or description"
    }
  ],
  "estimatedMinutes": 30
}`;

    default:
      return `Generate educational content based on: ${content}`;
  }
}

function getFallbackResponse(
  type: string,
  content: string,
  options?: { questionCount?: number },
) {
  const count = options?.questionCount ?? 5;

  switch (type) {
    case "quiz":
      return {
        questions: [
          {
            type: "mcq",
            question: `Based on the content provided, what is the main concept?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "A",
            explanation: "Review the content to identify the main concept.",
          },
          {
            type: "truefalse",
            question: `The content discusses an important topic. True or False?`,
            options: ["True", "False"],
            correctAnswer: "True",
            explanation: "The content clearly addresses this topic.",
          },
        ],
        note: "AI generation unavailable. These are placeholder questions. Please review and customize.",
      };

    case "practice":
      return {
        problems: [
          {
            problem: "Review the content and identify the key concepts.",
            hint: "Look for recurring themes and definitions.",
            solution: "The key concepts are found in the main sections of the content.",
            difficulty: "intermediate",
          },
        ],
        note: "AI generation unavailable. These are placeholder problems.",
      };

    case "summary":
      return {
        summary: `The provided content covers important educational concepts. Review the material carefully to understand the key ideas.`,
        keyPoints: ["Review the main concepts", "Identify key terms", "Apply the concepts"],
        vocabulary: [{ term: "Key term", definition: "Definition from context" }],
        note: "AI generation unavailable. This is a placeholder summary.",
      };

    case "improvements":
      return {
        strengths: ["Content covers relevant topics", "Well-structured"],
        suggestions: [
          { area: "Engagement", suggestion: "Add interactive elements or examples" },
          { area: "Clarity", suggestion: "Break complex ideas into smaller steps" },
        ],
        additionalTopics: ["Related concept 1", "Related concept 2"],
        engagementIdeas: ["Add real-world examples", "Include practice problems"],
        note: "AI generation unavailable. These are placeholder suggestions.",
      };

    case "lesson":
      return {
        title: "Generated Lesson",
        objectives: ["Understand key concepts", "Apply knowledge"],
        sections: [
          { type: "text", title: "Introduction", content: "Introduce the topic" },
          { type: "quiz", title: "Check Understanding", content: "Assess comprehension" },
        ],
        estimatedMinutes: 30,
        note: "AI generation unavailable. This is a placeholder lesson.",
      };

    default:
      return { note: "AI generation unavailable. Please try again later." };
  }
}
