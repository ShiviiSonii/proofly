# Public API keys

This document describes how to create and use **API keys** to read testimonials from Proofly in your own UI.

## 1. Create an API key (dashboard)

1. Sign in to your Proofly dashboard.
2. Open a **project**.
3. (You will add an \"API keys\" section in the project UI that calls these routes):
   - `GET  /api/projects/:projectId/api-keys` – list keys (name, createdAt, lastUsedAt, revoked)
   - `POST /api/projects/:projectId/api-keys` – create a new key
   - `DELETE /api/projects/:projectId/api-keys/:keyId` – revoke a key

### Create key (POST)

`POST /api/projects/:projectId/api-keys`

Body:

```json
{ "name": "Marketing site" }
```

Response:

```json
{
  "id": "apikey-uuid",
  "name": "Marketing site",
  "createdAt": "2026-02-18T12:34:56.000Z",
  "token": "pk_...very-long-token..."
}
```

> The `token` is only returned **once**. Copy it and store it safely. It will be used as your API key.

To revoke a key:

```http
DELETE /api/projects/:projectId/api-keys/:keyId
```

---

## 2. Public read API

Use this endpoint to read testimonials for a project using an API key.

`GET /api/public/projects/:projectId/testimonials`

### Auth

Pass your API key in **either**:

- Header:
  - `x-proofly-api-key: pk_...`
- Or query param (not recommended for production):
  - `?apiKey=pk_...`

### Query parameters

- `status` – optional, default `approved` (e.g. `pending`, `approved`, `rejected`)
- `categoryId` – optional, filter to a single category
- `limit` – optional, number of items (default 20, max 50)
- `cursor` – optional, for pagination (use the `nextCursor` from previous response)

### Response

```json
{
  "items": [
    {
      "id": "testimonial-id",
      "projectId": "project-id",
      "category": {
        "id": "category-id",
        "name": "Happy customers",
        "questions": [
          { "id": "q1", "label": "What did you like?", "type": "textarea", "order": 1 },
          { "id": "q2", "label": "Rating", "type": "rating", "order": 2 }
        ]
      },
      "status": "approved",
      "submittedBy": "Jane Doe",
      "createdAt": "2026-02-18T12:34:56.000Z",
      "data": {
        "q1": "Amazing product!",
        "q2": 5,
        "imageFieldId": "https://...supabase.../image.jpg",
        "videoFieldId": "https://res.cloudinary.com/.../video.mp4"
      }
    }
  ],
  "nextCursor": null
}
```

You can use `category.questions` to map `data` keys (`q1`, `q2`, etc.) to labels and types when building your own UI.

---

## 3. Example usage (frontend)

```ts
async function fetchTestimonials() {
  const res = await fetch(
    "https://your-domain.com/api/public/projects/PROJECT_ID/testimonials?status=approved&limit=10",
    {
      headers: {
        "x-proofly-api-key": "pk_...your-token-here..."
      }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to load testimonials");
  }

  const json = await res.json();
  return json.items;
}
```

You can then render the testimonials however you like: cards, sliders, grids, etc.

