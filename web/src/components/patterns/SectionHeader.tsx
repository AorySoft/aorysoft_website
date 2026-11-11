import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

/**
 * One header for every marketing section: optional eyebrow, display h2, lead,
 * then any links. `split` puts the lead beside the title from lg up, which
 * saves a band of height so sections fit one laptop screen (sizing rule).
 */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  children,
  split = false,
}: {
  /** id of the h2, for the section's aria-labelledby. */
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  split?: boolean;
}) {
  const heading = (
    <>
      {eyebrow ? <Eyebrow className="mb-[clamp(0.75rem,2svh,1.25rem)]">{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="display-title">
        {title}
      </h2>
    </>
  );
  const body = (
    <>
      {lead ? <p className={`body-lead ${split ? "mt-[clamp(0.75rem,2.5svh,1.25rem)] lg:mt-0" : "mt-[clamp(0.75rem,2.5svh,1.25rem)]"}`}>{lead}</p> : null}
      {children}
    </>
  );

  if (!split) {
    return (
      <div className="max-w-3xl">
        {heading}
        {body}
      </div>
    );
  }
  return (
    <div className="grid gap-x-12 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-5">{heading}</div>
      <div className="lg:col-span-7 lg:pb-1">{body}</div>
    </div>
  );
}
