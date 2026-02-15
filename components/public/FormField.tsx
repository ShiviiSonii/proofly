"use client";

type Question = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  options: unknown;
  validation: unknown;
};

type FormFieldProps = {
  question: Question;
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
  error?: string;
};

function getOptions(opts: unknown): string[] {
  if (Array.isArray(opts)) return opts as string[];
  return [];
}

export function FormField({ question, value, onChange, error }: FormFieldProps) {
  const opts = getOptions(question.options);
  const validation = (question.validation as { min?: number; max?: number }) || {};
  const min = validation.min ?? 1;
  const max = validation.max ?? 5;

  const label = (
    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {question.label}
      {question.required && <span className="text-red-500"> *</span>}
    </label>
  );

  const inputClass =
    "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const errorClass = "mt-1 text-xs text-red-600 dark:text-red-400";

  switch (question.type) {
    case "text":
    case "email":
      return (
        <div>
          {label}
          <input
            type={question.type}
            required={question.required}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder ?? undefined}
            className={inputClass}
          />
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            required={question.required}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder ?? undefined}
            rows={4}
            className={inputClass}
          />
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
    case "number":
    case "rating":
      if (question.type === "rating") {
        return (
          <div>
            {label}
            <div className="mt-2 flex gap-2">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition ${
                    value === n
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {error && <p className={errorClass}>{error}</p>}
          </div>
        );
      }
      return (
        <div>
          {label}
          <input
            type="number"
            required={question.required}
            value={(value as number) ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? "" : Number(v));
            }}
            placeholder={question.placeholder ?? undefined}
            min={validation.min}
            max={validation.max}
            className={inputClass}
          />
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
    case "dropdown":
      return (
        <div>
          {label}
          <select
            required={question.required}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            {opts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
    case "radio":
      return (
        <div>
          {label}
          <div className="mt-2 space-y-2">
            {opts.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  checked={value === o}
                  onChange={() => onChange(o)}
                  className="border-zinc-300"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{o}</span>
              </label>
            ))}
          </div>
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
    case "checkbox":
      const checked = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (option: string) => {
        const next = checked.includes(option)
          ? checked.filter((x) => x !== option)
          : [...checked, option];
        onChange(next);
      };
      return (
        <div>
          {label}
          <div className="mt-2 space-y-2">
            {opts.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked.includes(o)}
                  onChange={() => toggle(o)}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{o}</span>
              </label>
            ))}
          </div>
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
    default:
      return (
        <div>
          {label}
          <input
            type="text"
            required={question.required}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
          {error && <p className={errorClass}>{error}</p>}
        </div>
      );
  }
}
