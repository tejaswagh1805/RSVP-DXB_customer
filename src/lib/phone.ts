export const PHONE_COUNTRIES = [
  { country: "UAE", code: "+971", digits: 9, groups: [2, 3, 4], example: "50 000 0000", trunk: "0", starts: /^5/ },
  { country: "India", code: "+91", digits: 10, groups: [5, 5], example: "98765 43210", trunk: "", starts: /^[6-9]/ },
  { country: "Pakistan", code: "+92", digits: 10, groups: [3, 3, 4], example: "300 123 4567", trunk: "0", starts: /^3/ },
  { country: "Saudi Arabia", code: "+966", digits: 9, groups: [1, 4, 4], example: "50 1234 5678", trunk: "0", starts: /^5/ },
  { country: "United Kingdom", code: "+44", digits: 10, groups: [4, 3, 3], example: "7700 900123", trunk: "0", starts: /^7/ },
  { country: "United States", code: "+1", digits: 10, groups: [3, 3, 4], example: "202 555 0123", trunk: "", starts: /^[2-9]/ },
  { country: "Australia", code: "+61", digits: 9, groups: [3, 3, 3], example: "412 345 678", trunk: "0", starts: /^4/ },
  { country: "Bangladesh", code: "+880", digits: 10, groups: [3, 3, 4], example: "171 234 5678", trunk: "0", starts: /^1[3-9]/ },
  { country: "Egypt", code: "+20", digits: 10, groups: [3, 3, 4], example: "100 123 4567", trunk: "0", starts: /^1[0125]/ },
  { country: "Philippines", code: "+63", digits: 10, groups: [3, 3, 4], example: "917 123 4567", trunk: "0", starts: /^9/ },
] as const;

export type PhoneCountryCode = (typeof PHONE_COUNTRIES)[number]["code"];

function getCountry(code: string) {
  return PHONE_COUNTRIES.find((country) => country.code === code);
}

/** Validate national mobile length/prefix and normalize it to E.164. */
export function normalizeWhatsAppNumber(input: string, callingCode = "+971"): string {
  const country = getCountry(callingCode);
  if (!country) return "";

  let national = input.replace(/\D/g, "");
  const countryDigits = country.code.slice(1);
  if (national.startsWith("00")) national = national.slice(2);
  if (
    national.startsWith(countryDigits) &&
    (national.length === countryDigits.length + country.digits ||
      (country.trunk && national.length === countryDigits.length + country.digits + 1))
  ) {
    national = national.slice(countryDigits.length);
  }
  if (country.trunk && national.startsWith(country.trunk) && national.length === country.digits + 1) {
    national = national.slice(1);
  }

  if (national.length !== country.digits || !country.starts.test(national)) return "";
  const international = `${countryDigits}${national}`;
  return international.length <= 15 ? `+${international}` : "";
}

export function formatPhoneNational(input: string, callingCode = "+971"): string {
  const country = getCountry(callingCode);
  const digits = input.replace(/\D/g, "");
  if (!country || !digits) return "";

  const chunks: string[] = [];
  let offset = 0;
  for (const size of country.groups) {
    if (offset >= digits.length) break;
    chunks.push(digits.slice(offset, offset + size));
    offset += size;
  }
  if (offset < digits.length) chunks.push(digits.slice(offset));
  return chunks.join(" ");
}
