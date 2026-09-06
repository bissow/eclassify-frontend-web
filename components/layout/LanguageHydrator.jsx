"use client";
import { useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCurrentLanguage } from "@/store/slices/languageSlice";

// Same pattern as SettingsHydrator — seeds redux before first client paint,
// never runs during SSR (useLayoutEffect), so no cross-request store leak.
export default function LanguageHydrator({ data, children }) {
  const dispatch = useDispatch();
  const hydrated = useRef(false);

  useLayoutEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (data) dispatch(setCurrentLanguage(data));
  }, [data, dispatch]);

  return children;
}
