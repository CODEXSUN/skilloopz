"use client";

interface TextContent {
  markdown?: string;
  content?: string;
  formatting?: {
    textColor?: string;
    bgColor?: string;
    fontSize?: "sm" | "md" | "lg";
  };
}

interface TextBlockProps {
  content: Record<string, unknown>;
}

export function TextBlock({ content }: TextBlockProps) {
  const { markdown, content: textContent, formatting } = content as TextContent;
  const text = markdown ?? textContent ?? "";

  const fontSizeClass = formatting?.fontSize === "sm"
    ? "text-sm"
    : formatting?.fontSize === "lg"
      ? "text-lg"
      : "text-base";

  const textColor = formatting?.textColor;
  const bgColor = formatting?.bgColor;

  if (!text) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-tertiary-foreground">
        Empty text block
      </div>
    );
  }

  return (
    <div
      className={`prose prose-gray max-w-none ${fontSizeClass}`}
      style={{
        ...(textColor && { color: textColor }),
        ...(bgColor && { backgroundColor: bgColor, padding: "1rem", borderRadius: "0.5rem" }),
      }}
    >
      {text.split("\n").map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-2xl font-bold">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-xl font-semibold">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-lg font-medium">{line.slice(4)}</h3>;
        }
        if (line.startsWith("- ")) {
          return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-border pl-4 italic text-muted-foreground">
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith("```")) {
          return null;
        }
        if (line.trim() === "") {
          return <div key={i} className="h-4" />;
        }
        return <p key={i} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
}
