import React from "react";
import Link, { LinkProps } from "next/link";

type PrefetchLinkProps = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const PrefetchLink = React.forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ children, ...props }, ref) => {
    return (
      <Link ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);

PrefetchLink.displayName = "PrefetchLink";
