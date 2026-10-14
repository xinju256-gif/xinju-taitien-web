import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function InternalLink({
  to,
  children,
  className = "text-link",
  glyph = "arrow",
}: {
  to: string;
  children: ReactNode;
  className?: string;
  glyph?: string;
}) {
  return (
    <a className={className} href={`#${to}`}>
      {children}
      {glyph ? <Icon name={glyph} /> : null}
    </a>
  );
}
