// Shared result shape for the public form server actions.
//
// Lives in its own module (not actions.ts) because a "use server" file may
// only export async functions — a const would be rejected at build time.
// Client components import both the type and the idle value from here.

export type FormState = {
  status: "idle" | "success" | "error";
  /** Generic, visitor-safe message. Never contains SQL or vendor detail. */
  message: string;
  /** Per-field validation errors, keyed by field name. */
  fieldErrors?: Record<string, string>;
};

/** The value every useActionState() call starts from. */
export const idleFormState: FormState = { status: "idle", message: "" };
