"use client";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { CurrentLanguageData } from "@/store/slices/languageSlice";
import enTranslation from "@/lang/locale/en.json";

// Same lookup as utils/index.jsx's t(), but subscribed via useSelector so
// components re-render on language change instead of reading store.getState() once.
export function useTranslation() {
  const langFile = useSelector(CurrentLanguageData)?.file_name;

  const t = useCallback(
    (label) => langFile?.[label] || enTranslation[label] || label,
    [langFile]
  );

  return { t };
}
