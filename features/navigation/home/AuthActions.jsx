"use client";
import { useSelector } from "react-redux";
import { getIsLoggedIn } from "@/store/slices/authSlice.js";
import { useTranslation } from "@/lang/useTranslation";
import { truncate } from "@/lib/utils";
import ProfileDropdown from "@/features/navigation/home/ProfileDropdown.jsx";

// Client-only (imported with ssr:false). Auth comes from redux-persist, i.e.
// localStorage, which the server cannot see — rendering this branch on the
// server would emit the logged-out markup and mismatch on hydration.
// The whole branch has to be client-only, not just ProfileDropdown: the two
// arms produce different elements, so the mismatch is at the branch itself.
const AuthActions = ({
  IsLogout,
  setIsLogout,
  setIsLoginOpen,
  setIsRegisterModalOpen,
}) => {
  const IsLoggedin = useSelector(getIsLoggedIn);
  const { t } = useTranslation();

  if (IsLoggedin) {
    return <ProfileDropdown setIsLogout={setIsLogout} IsLogout={IsLogout} />;
  }

  return (
    <>
      <button onClick={() => setIsLoginOpen(true)} title={t("login")}>
        {truncate(t("login"), 12)}
      </button>
      <span className="border-l h-6 self-center"></span>
      <button
        onClick={() => setIsRegisterModalOpen(true)}
        title={t("register")}
      >
        {truncate(t("register"), 12)}
      </button>
    </>
  );
};

export default AuthActions;
