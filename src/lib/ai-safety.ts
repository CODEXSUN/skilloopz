const PROFANITY_WORDS = new Set([
  "fuck", "shit", "bitch", "ass", "damn", "hell", "crap", "bastard",
  "dick", "pussy", "cock", "cunt", "whore", "slut", "nigger", "faggot",
  "retard", "nazi", "hitler", "porn", "sex", "rape", "murder", "kill",
  "suicide", "bomb", "terrorist", "drug", "weed", "cocaine", "heroin",
]);

const SENSITIVE_TOPICS = [
  "self-harm", "suicide", "eating disorder", "abuse", "violence",
  "sexual content", "drug use", "weapon", "hate speech",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  for (const word of PROFANITY_WORDS) {
    if (lower.includes(word)) return true;
  }
  return false;
}

export function containsSensitiveTopic(text: string): string | null {
  const lower = text.toLowerCase();
  for (const topic of SENSITIVE_TOPICS) {
    if (lower.includes(topic)) return topic;
  }
  return null;
}

export interface SafetyCheck {
  passed: boolean;
  issues: string[];
  sanitizedContent: string;
}

export function runSafetyCheck(content: string, ageGroup?: string): SafetyCheck {
  const issues: string[] = [];
  let sanitized = content;

  if (containsProfanity(content)) {
    issues.push("Content contains inappropriate language");
    for (const word of PROFANITY_WORDS) {
      const regex = new RegExp(word, "gi");
      sanitized = sanitized.replace(regex, "*".repeat(word.length));
    }
  }

  const sensitiveTopic = containsSensitiveTopic(content);
  if (sensitiveTopic) {
    issues.push(`Content references sensitive topic: ${sensitiveTopic}`);
  }

  if (content.length > 10000) {
    issues.push("Content exceeds maximum length (10,000 characters)");
    sanitized = sanitized.substring(0, 10000);
  }

  if (ageGroup === "under13" && issues.length > 0) {
    return {
      passed: false,
      issues: ["Content not suitable for children under 13", ...issues],
      sanitizedContent: sanitized,
    };
  }

  return {
    passed: issues.length === 0,
    issues,
    sanitizedContent: sanitized,
  };
}

export function sanitizeAIResponse(response: string): string {
  let sanitized = response;

  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(word, "gi");
    sanitized = sanitized.replace(regex, "*".repeat(word.length));
  }

  return sanitized;
}
