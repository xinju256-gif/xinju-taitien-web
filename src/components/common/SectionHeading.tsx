import { InternalLink } from "./InternalLink";

export function SectionHeading({
  eyebrow,
  title,
  desc = "",
  url = "",
  label = "",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  url?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {desc ? <p className="section-description">{desc}</p> : ""}
      </div>
      {url ? <InternalLink to={url}>{label}</InternalLink> : ""}
    </div>
  );
}
