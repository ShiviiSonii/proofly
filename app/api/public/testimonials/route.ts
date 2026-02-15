import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getOptionsArray(opts: unknown): string[] {
  if (Array.isArray(opts)) return opts as string[];
  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, data, submittedBy } = body;

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const category = await prisma.testimonialCategory.findUnique({
      where: { id: categoryId },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    if (!category.isActive) {
      return NextResponse.json({ error: "Form is not accepting submissions" }, { status: 404 });
    }

    const errors: Record<string, string> = {};
    const validatedData: Record<string, string | number | string[]> = {};

    for (const q of category.questions) {
      const value = data[q.id];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (q.required && isEmpty) {
        errors[q.id] = "This field is required";
        continue;
      }
      if (isEmpty) {
        continue;
      }

      switch (q.type) {
        case "text":
        case "textarea":
        case "email":
          if (typeof value !== "string") {
            errors[q.id] = "Invalid value";
            break;
          }
          if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[q.id] = "Please enter a valid email";
            break;
          }
          validatedData[q.id] = value;
          break;
        case "number":
        case "rating": {
          const num = Number(value);
          if (Number.isNaN(num)) {
            errors[q.id] = "Please enter a number";
            break;
          }
          const validation = (q.validation as { min?: number; max?: number }) || {};
          const min = validation.min;
          const max = validation.max;
          if (min != null && num < min) errors[q.id] = `Minimum is ${min}`;
          else if (max != null && num > max) errors[q.id] = `Maximum is ${max}`;
          else validatedData[q.id] = num;
          break;
        }
        case "dropdown":
        case "radio": {
          const opts = getOptionsArray(q.options);
          if (typeof value !== "string" || !opts.includes(value)) {
            errors[q.id] = "Invalid option";
            break;
          }
          validatedData[q.id] = value;
          break;
        }
        case "checkbox": {
          const opts = getOptionsArray(q.options);
          const arr = Array.isArray(value) ? value : [value];
          if (!arr.every((v) => typeof v === "string" && opts.includes(v))) {
            errors[q.id] = "Invalid option";
            break;
          }
          validatedData[q.id] = arr as string[];
          break;
        }
        default:
          validatedData[q.id] = String(value);
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        categoryId,
        data: validatedData,
        submittedBy: typeof submittedBy === "string" && submittedBy.trim() ? submittedBy.trim() : null,
      },
    });

    return NextResponse.json({ success: true, id: testimonial.id }, { status: 201 });
  } catch (error) {
    console.error("Testimonial submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
