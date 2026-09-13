"use client";

import { useEffect } from "react";

/**
 * Removes attributes injected by browser extensions (e.g. bis_skin_checked)
 * before React hydration, preventing hydration mismatch warnings.
 */
export default function ExtensionCleaner() {
  useEffect(() => {
    // Remove extension-injected attributes from the DOM
    const injected = document.querySelectorAll("[bis_skin_checked]");
    injected.forEach((el) => el.removeAttribute("bis_skin_checked"));
  }, []);

  return null;
}
