import type { SVGProps } from 'react';

/** The approved monochrome S mark, shared by the welcome and account surfaces. */
export function BrandSymbol(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true" {...props}>
    <circle cx="24" cy="24" r="21" fill="currentColor" />
    <path d="M34.6 13.8c-3.4-3.7-10.7-4.6-15.5-2.2-5.8 2.9-5.5 8.2 1 10.4l7 2.3c7.2 2.4 9 6.5 4.7 10.2-4.4 3.8-12 3.2-17.2-.6" stroke="var(--sb-canvas)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
