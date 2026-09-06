import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getMinRange, getMaxRange } from "@/store/slices/settingSlice";
import { getKmRangeClient, saveKilometerRange } from "@/lib/location";
import { getIsRtl } from "@/store/slices/languageSlice";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { useLanguageSync } from "@/components/layout/useLanguageSync";
import { useParams } from "next/navigation";

// System settings themselves are fetched server-side (app/[lang]/layout.jsx)
// and hydrated into redux via SettingsHydrator — this hook only reacts to
// that already-hydrated data, it no longer fetches anything itself.
export function useClientLayoutLogic() {
  const { lang } = useParams();
  const isRtl = useSelector(getIsRtl);
  const appliedRange = getKmRangeClient();
  const minRange = useSelector(getMinRange);
  const maxRange = useSelector(getMaxRange);
  const token = useSelector(getIsLoggedIn);

  // Custom hook to handle language synchronization and translation fetching
  useLanguageSync(lang);

  // Mirror the redux auth token into a cookie so Server Components can forward
  // it for personalized fields (is_liked). Covers login, logout and refresh
  // rehydration. Not httpOnly — same exposure the token already has in
  // redux-persist/localStorage.
  useEffect(() => {
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } else {
      document.cookie = "token=; path=/; max-age=0";
    }
  }, [token]);

  useEffect(() => {
    if (appliedRange < minRange) saveKilometerRange(minRange);
    else if (appliedRange > maxRange) saveKilometerRange(maxRange);
  }, [minRange, maxRange]);

  // Set direction of the document
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);
}
