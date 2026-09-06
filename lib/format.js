import { getCountryCallingCode } from "react-phone-number-input";
import { countryLocaleMap, languageLocaleMap } from "@/lang";

export const timeAgo = (createdAt, locale = "en") => {
  const date = new Date(createdAt);
  if (isNaN(date)) return "";
  const seconds = Math.floor((Date.now() - date) / 1000);
  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "narrow" });
  } catch {
    rtf = new Intl.RelativeTimeFormat("en", { numeric: "always", style: "narrow" });
  }
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), "day");
  if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), "month");
  return rtf.format(-Math.floor(seconds / 31536000), "year");
};

export const extractYear = (dateString) => {
  const date = new Date(dateString);
  return date.getFullYear();
};

export const formatPriceAbbreviated = (price, t, settings) => {
  if (
    price === null ||
    price === undefined ||
    (typeof price === "string" && price.trim() === "")
  ) {
    return "";
  }

  if (Number(price) === 0) {
    return t("free");
  }

  const currencySymbol = settings?.currency_symbol;
  const currencyPosition = settings?.currency_symbol_position;
  const countryCode =
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() || "US";
  const locale = countryLocaleMap[countryCode] || "en-US";

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Number(price));

  return currencyPosition === "right"
    ? `${formattedNumber} ${currencySymbol}`
    : `${currencySymbol} ${formattedNumber}`;
};

export const formatSubscriptionDate = (dateString) => {
  if (!dateString) return "-";

  const countryCode =
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() || "US";
  const locale = countryLocaleMap[countryCode] || "en-US";
  const date = new Date(dateString);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

// utils/stickyNote.js

export const formatTime = (dateString, t) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return t("now");
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays === 1) {
    return t("yesterday");
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  } else {
    return `${diffInYears}y`;
  }
};

export const formatChatMessageTime = (dateString, langCode) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const locale = languageLocaleMap?.[langCode] || "en-US";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateMonthYear = (dateString, langCode) => {
  if (!dateString) return "";

  const locale = languageLocaleMap?.[langCode] || "en-US";
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatMessageDate = (dateString, t, langCode) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return t("today");
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return t("yesterday");
  } else {
    return formatDateMonthYear(dateString, langCode);
  }
};

export const getDefaultCountryCode = (defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase()) => {
  try {

    if (defaultCountry) {
      return getCountryCallingCode(defaultCountry);
    }
  } catch (error) {
    console.log("Error getting country calling code:", error);
  }
  return "91"; // Fallback to "91" if env var is not set or invalid
};

// Groups a raw "1234.5" price string using the currency's own separators — display only.
export const groupPrice = (raw, currency) => {
  if (raw === null || raw === undefined || raw === "") return "";
  const thousandSep = currency?.thousand_separator || ",";
  const decimalSep = currency?.decimal_separator || ".";
  const [intPart, decPart] = String(raw).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  return decPart !== undefined ? `${grouped}${decimalSep}${decPart}` : grouped;
};

// Reverses groupPrice back to a plain "1234.5" string. Returns null if the
// result isn't a valid number-in-progress (e.g. malformed paste) so callers
// can reject the keystroke instead of storing garbage.
export const ungroupPrice = (formatted, currency) => {
  const thousandSep = currency?.thousand_separator || ",";
  const decimalSep = currency?.decimal_separator || ".";
  const withoutThousands = formatted.split(thousandSep).join("");
  const raw = decimalSep === "." ? withoutThousands : withoutThousands.split(decimalSep).join(".");
  return /^\d*\.?\d*$/.test(raw) ? raw : null;
};

export const formatPhoneNumber = (number = "", countryCode = "") => {
  if (!number || !countryCode) return number;

  // Remove non-digit characters from country code
  const countryCodeDigitsOnly = countryCode.replace(/\D/g, "");

  // Remove non-digit characters from number (optional but safer)
  const digitsOnlyNumber = number.replace(/\D/g, "");

  // Check if number starts with country code
  if (digitsOnlyNumber.startsWith(countryCodeDigitsOnly)) {
    return digitsOnlyNumber.substring(countryCodeDigitsOnly.length);
  }

  return digitsOnlyNumber;
};
