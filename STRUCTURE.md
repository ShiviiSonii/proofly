# Proofly — Project structure

File and folder naming:

- **Routes:** `app/` uses Next.js App Router; folder names = URL segments. Dynamic segments use `[param]`.
- **Components:** PascalCase filenames (e.g. `SessionProvider.tsx`, `CategoryForm.tsx`). Grouped by feature under `components/`.
- **Config / lib:** lowercase with hyphens for multi-word (e.g. `next.config.ts`, `question-types.ts`).

## Full file tree (with one-line summary per file)

```
proofly/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx                    — Sign-in page (email/password).
│   │   └── sign-up/
│   │       └── page.tsx                    — Sign-up / registration page.
│   ├── api/
│   │   ├── auth/
│   │   │   └── register/
│   │   │       └── route.ts                — POST: register a new user.
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── categories/
│   │   │   │   │   ├── [categoryId]/
│   │   │   │   │   │   ├── questions/
│   │   │   │   │   │   │   ├── [questionId]/
│   │   │   │   │   │   │   │   └── route.ts                — PATCH/DELETE a single question.
│   │   │   │   │   │   │   └── route.ts                    — GET list questions, POST create question.
│   │   │   │   │   │   ├── route.ts                        — GET/PATCH/DELETE a single category.
│   │   │   │   │   │   └── testimonials/
│   │   │   │   │   │       ├── [testimonialId]/
│   │   │   │   │   │       │   └── route.ts                — PATCH testimonial (e.g. approve/reject).
│   │   │   │   │   │       └── route.ts                    — GET list testimonials for category.
│   │   │   │   │   └── route.ts                            — GET list categories, POST create category.
│   │   │   │   └── route.ts                                — GET/PATCH/DELETE a single project.
│   │   │   └── route.ts                                    — GET list projects, POST create project.
│   │   └── public/
│   │       ├── categories/
│   │       │   └── [categoryId]/
│   │       │       └── form/
│   │       │           └── route.ts                        — GET form config for public testimonial form (no auth).
│   │       └── testimonials/
│   │           └── route.ts                                — POST submit a testimonial (public).
│   ├── dashboard/
│   │   ├── layout.tsx                      — Dashboard layout wrapper (protected).
│   │   ├── page.tsx                        — Dashboard home: list projects.
│   │   └── projects/
│   │       ├── [id]/
│   │       │   ├── categories/
│   │       │   │   ├── [categoryId]/
│   │       │   │   │   ├── page.tsx                        — Category detail: edit, share link, embed snippet, testimonials link.
│   │       │   │   │   ├── setup/
│   │       │   │   │   │   └── page.tsx                    — Form setup: add/reorder questions for this category.
│   │       │   │   │   └── testimonials/
│   │       │   │   │       └── page.tsx                    — List and manage testimonials for this category.
│   │       │   │   ├── new/
│   │       │   │   │   └── page.tsx                        — New category form page.
│   │       │   │   └── page.tsx                            — Categories list for a project.
│   │       │   └── page.tsx                                — Single project detail page.
│   │       ├── new/
│   │       │   └── page.tsx                                — New project form page.
│   │       └── page.tsx                                    — Projects list page.
│   ├── embed/
│   │   └── testimonials/
│   │       └── [categoryId]/
│   │           ├── layout.tsx              — Embed layout: metadata (title, noindex).
│   │           └── page.tsx                 — Embed page: approved testimonials only (for iframe on external sites).
│   ├── submit/
│   │   └── [categoryId]/
│   │       └── page.tsx                    — Public testimonial submission form (shareable link).
│   ├── favicon.ico                         — Site favicon.
│   ├── globals.css                         — Global CSS (Tailwind, etc.).
│   ├── layout.tsx                         — Root layout: font, SessionProvider, global styles.
│   └── page.tsx                            — Home page.
├── components/
│   ├── categories/
│   │   ├── CategoryCard.tsx                 — Card UI for one category.
│   │   ├── CategoryForm.tsx                 — Create/edit category form.
│   │   └── DeleteCategoryButton.tsx         — Button to delete a category.
│   ├── embed/
│   │   └── EmbedSnippet.tsx                — Copy-paste embed code block for dashboard.
│   ├── projects/
│   │   ├── DeleteProjectButton.tsx          — Button to delete a project.
│   │   ├── ProjectCard.tsx                 — Card UI for one project.
│   │   └── ProjectForm.tsx                 — Create/edit project form.
│   ├── public/
│   │   ├── FormField.tsx                   — Single form field used in testimonial form.
│   │   ├── ShareTestimonialLink.tsx         — Shareable submit link with copy button.
│   │   └── TestimonialForm.tsx             — Public testimonial submission form UI.
│   ├── questions/
│   │   ├── QuestionForm.tsx                — Create/edit form question.
│   │   └── QuestionList.tsx                — List and reorder form questions.
│   ├── testimonials/
│   │   ├── TestimonialCard.tsx             — Card UI for one testimonial.
│   │   └── TestimonialsFilter.tsx          — Filter testimonials (e.g. by status).
│   └── SessionProvider.tsx                 — Wraps app with NextAuth SessionProvider.
├── lib/
│   ├── prisma.ts                           — Prisma client singleton.
│   ├── question-types.ts                   — Question type constants and helpers.
│   └── slug.ts                             — Slug generation and validation.
├── prisma/
│   └── schema.prisma                       — Database schema (Prisma).
├── public/
│   └── embed.js                            — Script for external sites: injects iframe to load testimonials embed.
├── auth.ts                                 — NextAuth configuration.
├── eslint.config.mjs                       — ESLint configuration.
├── next.config.ts                          — Next.js config (e.g. embed route headers).
├── next-env.d.ts                           — Next.js TypeScript declarations.
├── package.json                            — Dependencies and npm scripts.
├── postcss.config.mjs                      — PostCSS configuration.
├── prisma.config.ts                        — Prisma configuration.
├── proxy.ts                                — Middleware: redirect guests to sign-in, logged-in users away from auth pages.
├── tsconfig.json                           — TypeScript configuration.
└── STRUCTURE.md                            — Project structure and file summaries (this doc).
```

## Key routes

| URL | Purpose |
|-----|--------|
| `/` | Home |
| `/sign-in`, `/sign-up` | Auth |
| `/dashboard` | Dashboard (projects, categories) |
| `/submit/[categoryId]` | Public testimonial form (shareable link) |
| `/embed/testimonials/[categoryId]` | Embeddable approved testimonials (iframe) |
