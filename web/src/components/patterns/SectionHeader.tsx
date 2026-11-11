import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

/** One header for every marketing section: optional eyebrow, display h2, lead, then any links. */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  /** id of the h2, for the section's aria-labelledby. */
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="display-title">
        {title}
      </h2>
      {lead ? <p className="body-lead mt-5">{lead}</p> : null}
      {children}
    </div>
  );
}
