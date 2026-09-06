"use client";
import { ProgressProvider } from "@bprogress/next/app";
import SettingsHydrator from "./SettingsHydrator";
import LanguageHydrator from "./LanguageHydrator";
import PushNotificationLayout from "./PushNotificationLayout";

// Single entry point for everything that must run once, client-side, at
// app boot: redux settings + language hydration, then push-notification
// setup + RTL/km-range side effects (see PushNotificationLayout).
// ProgressProvider covers every navigation (CustomLink, useNavigate,
// LanguageDropdown) without wiring each call site individually.
// shallowRouting makes it also complete on searchParams-only changes
// (filters, sort) — unlike NextTopLoader, it doesn't patch
// history.pushState globally, so it can't be cancelled by unrelated calls.
export default function AppBootstrap({ data, languageData, children }) {
  return (
    <ProgressProvider
      color="var(--primary)"
      height="5px"
      options={{ showSpinner: false }}
      shallowRouting
      disableSameURL={false}
    >
      <SettingsHydrator data={data}>
        <LanguageHydrator data={languageData}>
          <PushNotificationLayout>{children}</PushNotificationLayout>
        </LanguageHydrator>
      </SettingsHydrator>
    </ProgressProvider>
  );
}
