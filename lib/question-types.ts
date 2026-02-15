export const QUESTION_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text (paragraph)" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "rating", label: "Rating (1-5 stars)" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Radio buttons" },
  { value: "checkbox", label: "Checkbox" },
] as const;

export type QuestionTypeValue = (typeof QUESTION_TYPES)[number]["value"];

export function needsOptions(type: string): boolean {
  return ["dropdown", "radio", "checkbox"].includes(type);
}

export function getValidationDefaults(type: string): Record<string, unknown> | null {
  if (type === "rating") return { min: 1, max: 5 };
  if (type === "number") return { min: undefined, max: undefined };
  return null;
}
