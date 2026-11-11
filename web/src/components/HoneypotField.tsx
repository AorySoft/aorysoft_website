/**
 * Spam honeypot — hidden from assistive tech and tab order (FRONTEND_AUDIT F38).
 * Bots that fill `name="website"` still trip the server check.
 */
export default function HoneypotField({ id = "website-hp" }: { id?: string }) {
  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor={id}>Website</label>
      <input
        type="text"
        id={id}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
        hidden
      />
    </div>
  );
}
