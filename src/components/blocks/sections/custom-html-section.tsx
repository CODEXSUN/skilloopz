"use client";

export function CustomHtmlSection({ content }: { content: Record<string, unknown> }) {
  const html = content.html as string | undefined;

  return (
    <div className="py-4 text-sm text-muted-foreground">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        "Custom HTML block"
      )}
    </div>
  );
}
