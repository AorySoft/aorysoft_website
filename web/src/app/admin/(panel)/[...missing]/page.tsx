import { notFound } from "next/navigation";

/**
 * Deep unmatched /admin/* URLs: render the admin 404 (behind the panel auth
 * guard) instead of falling through to the public 404 with marketing chrome.
 */
export default function AdminMissingPage() {
  notFound();
}
