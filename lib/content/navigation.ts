import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { withFields } from "./translate";
import type { Locale, NavItem, NavLocation } from "./types";

/**
 * Navigation — menus are data, reorderable without a deploy.
 *
 * Returns a nested tree: top-level items with their children attached. Only
 * `visible` rows are returned, matching the RLS policy so server and anon
 * reads agree on what a menu contains.
 */
export const getNavigation = cache(
  async (location: NavLocation, locale: Locale): Promise<NavItem[]> => {
    const { data, error } = await supabaseServer
      .from("navigation")
      .select("*")
      .eq("location", location)
      .eq("visible", true)
      .order("sort_order");

    if (error) {
      throw new Error(`Failed to load ${location} navigation: ${error.message}`);
    }

    const rows = await withFields("nav_item", data ?? [], locale);

    const byId = new Map<string, NavItem>();
    for (const row of rows) {
      byId.set(row.id, { ...row, children: [] });
    }

    const roots: NavItem[] = [];
    for (const item of byId.values()) {
      if (item.parent_id === null) {
        roots.push(item);
        continue;
      }
      // A child whose parent is hidden or missing is promoted rather than
      // dropped: losing a nav entry silently is worse than a flat menu, and
      // "no dead ends" is a non-negotiable.
      const parent = byId.get(item.parent_id);
      if (parent) parent.children.push(item);
      else roots.push(item);
    }

    const bySortOrder = (a: NavItem, b: NavItem) => a.sort_order - b.sort_order;
    roots.sort(bySortOrder);
    for (const item of roots) item.children.sort(bySortOrder);

    return roots;
  },
);
