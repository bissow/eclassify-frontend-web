"use client";
import { useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { settingsSucess } from "@/store/slices/settingSlice";

// Seeds redux with server-fetched settings before first client paint.
// useLayoutEffect never runs during SSR, so this can't leak state across
// requests through the redux module singleton.
export default function SettingsHydrator({ data, children }) {
  const dispatch = useDispatch();
  const hydrated = useRef(false);

  useLayoutEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    dispatch(settingsSucess({ data }));
  }, [data, dispatch]);

  return children;
}
