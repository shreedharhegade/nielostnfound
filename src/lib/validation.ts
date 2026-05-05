// Input validation helpers — no external dependency needed

export interface ValidationError {
  field: string;
  message: string;
}

export function validateItemInput(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  const title = String(data.title ?? "").trim();
  const description = String(data.description ?? "").trim();
  const type = String(data.type ?? "");
  const category = String(data.category ?? "");
  const location = String(data.location ?? "").trim();
  const date = String(data.date ?? "");
  const phone = String(data.phone ?? "").trim();

  if (!title) errors.push({ field: "title", message: "Title is required" });
  if (title.length > 100) errors.push({ field: "title", message: "Title must be 100 characters or fewer" });

  if (!description) errors.push({ field: "description", message: "Description is required" });
  if (description.length > 500) errors.push({ field: "description", message: "Description must be 500 characters or fewer" });

  if (!["lost", "found"].includes(type))
    errors.push({ field: "type", message: "Type must be 'lost' or 'found'" });

  const validCategories = ["Electronics", "Keys", "Documents", "Clothing", "Other"];
  if (!validCategories.includes(category))
    errors.push({ field: "category", message: "Invalid category" });

  if (!location) errors.push({ field: "location", message: "Location is required" });
  if (location.length > 200) errors.push({ field: "location", message: "Location must be 200 characters or fewer" });

  if (!date) {
    errors.push({ field: "date", message: "Date is required" });
  } else {
    const d = new Date(date);
    if (isNaN(d.getTime())) errors.push({ field: "date", message: "Invalid date" });
    if (d > new Date()) errors.push({ field: "date", message: "Date cannot be in the future" });
  }

  if (phone) {
    // E.164-ish: optional +, then 7-15 digits, optional spaces/dashes
    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone))
      errors.push({ field: "phone", message: "Invalid phone number format" });
  }

  return errors;
}

export function validateClaimInput(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const message = String(data.message ?? "").trim();

  if (!message) errors.push({ field: "message", message: "Message is required" });
  if (message.length > 500) errors.push({ field: "message", message: "Message must be 500 characters or fewer" });

  return errors;
}

export function sanitizeString(str: unknown): string {
  return String(str ?? "").trim().replace(/<[^>]*>/g, ""); // strip HTML tags
}
