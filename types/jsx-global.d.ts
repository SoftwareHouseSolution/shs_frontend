import type * as React from "react";

/**
 * The design system's 11 .d.ts files annotate returns as `JSX.Element` and props as
 * `keyof JSX.IntrinsicElements`, using the *global* JSX namespace. React 19's types
 * removed that global in favour of `React.JSX`.
 *
 * This shim restores it additively so those declaration files typecheck untouched.
 * Editing them instead would desync them from the design system and break the
 * byte-parity check that proves this port is faithful.
 */
declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type ElementClass = React.JSX.ElementClass;
  }
}

export {};
