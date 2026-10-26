"use client";

/// <reference types="react/canary" />
/*
 * `ViewTransition` ships in the React canary that Next vendors for the App
 * Router; its types live in `@types/react/canary`, which the reference above
 * pulls in for the whole program. It sits here, beside the only file that
 * needs it, rather than in `next-env.d.ts` (generated) or `tsconfig.json`
 * (devops').
 */
import { ViewTransition } from "react";

import { MOTION_LAYER } from "@/lib/motion/flag";

import { liftTransitionReady } from "./lift";

/**
 * The page-transition container (decision 063, item 5). Wraps `<main>` in both
 * route-group layouts under one name, so a navigation inside a group is an
 * `update` of the same container and landing ↔ site is a `share` between two.
 * Either way the container moves; its content never transforms on its own.
 *
 * The class is the only thing decided here: `nav-pan-forward` / `nav-pan-back`
 * when the navigation carries the prev/next chapter types, `nav-main`
 * otherwise. WHICH animation `nav-main` runs (cross-resolve, descend, ascend,
 * history) is decided by `html[data-nav]`, which `NavProgress` writes before
 * the transition starts; without it every rule in globals.css is a cut.
 *
 * `onUpdate` fires once the transition's pseudo-elements exist; it is where
 * the gallery → cover lift (decision 065, `lift.ts`) retimes its hand-over
 * and learns when the transition ends. A no-op on every other move. This is
 * why the file is a client component: the callback is a function prop.
 *
 * Flag off: the plain element, exactly the MVP-1 tree.
 */
const CLASS = {
  "nav-forward": "nav-pan-forward",
  "nav-back": "nav-pan-back",
  default: "nav-main",
};

function onUpdate() {
  liftTransitionReady();
}

export function MainTransition({ children }: { children: React.ReactNode }) {
  if (!MOTION_LAYER) return <>{children}</>;
  return (
    <ViewTransition name="site-main" default={CLASS} onUpdate={onUpdate}>
      {children}
    </ViewTransition>
  );
}
