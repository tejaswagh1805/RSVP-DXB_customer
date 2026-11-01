const DEFAULT_CREATOR_PASS_FORM_URL = "https://docs.google.com/forms/d/1VvAsWM2fEU_4NILdJvtKy0D4cPkzTRbG9ODfe7bTwcM/viewform";

const configuredUrl = String(import.meta.env["VITE_CREATOR_PASS_GOOGLE_FORM_URL"] || DEFAULT_CREATOR_PASS_FORM_URL).trim();

export const creatorPassFormUrl = /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i.test(configuredUrl)
  ? configuredUrl
  : DEFAULT_CREATOR_PASS_FORM_URL;
