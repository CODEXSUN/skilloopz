export interface ValidationResult {
  type: "error" | "warning";
  message: string;
  sectionId?: string;
}

interface Section {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
}

interface PageMeta {
  title: string;
}

export function validatePublish(pageMeta: PageMeta, sections: Section[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!pageMeta.title?.trim()) {
    results.push({ type: "error", message: "Page must have a title" });
  }

  if (sections.length === 0) {
    results.push({ type: "error", message: "Page has no sections — add at least one section" });
    return results;
  }

  for (const section of sections) {
    const content = section.content ?? {};
    const contentKeys = Object.keys(content);

    if (contentKeys.length === 0) {
      results.push({ type: "warning", message: `"${section.blockType}" has no content fields`, sectionId: section.id });
      continue;
    }

    const emptyFields = contentKeys.filter((k) => {
      const val = content[k];
      return val === "" || val === null || val === undefined || (typeof val === "string" && val.trim() === "");
    });

    if (emptyFields.length === contentKeys.length) {
      results.push({ type: "warning", message: `"${section.blockType}" has all empty fields`, sectionId: section.id });
    } else if (emptyFields.length > 0) {
      results.push({
        type: "warning",
        message: `"${section.blockType}" has empty fields: ${emptyFields.join(", ")}`,
        sectionId: section.id,
      });
    }
  }

  if (!results.some((r) => r.type === "error")) {
    results.push({ type: "warning", message: "Responsive check recommended — preview on tablet and mobile" });
  }

  return results;
}
