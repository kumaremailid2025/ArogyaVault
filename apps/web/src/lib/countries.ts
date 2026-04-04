import { z } from "zod";

/* ── Country code enum ────────────────────────────────────────────── */

/**
 * ISO 3166-1 alpha-2 country codes supported by ArogyaVault.
 * Add new countries here — the rest of the system picks them up
 * automatically (dial code, flag, phone validation, etc.).
 */
export const CountryCode = {
  IN: "IN",
  // US: "US",
  // AE: "AE",
} as const;

export type CountryCode = (typeof CountryCode)[keyof typeof CountryCode];

/* ── Per-country phone validation rules ───────────────────────────── */

export interface PhoneRule {
  /** Regex the *local* number (without dial code) must match. */
  pattern: RegExp;
  /** Max digits the user can type. */
  maxLength: number;
  /** Placeholder shown inside the input. */
  placeholder: string;
  /** Zod error message when the pattern fails. */
  errorMessage: string;
}

/* ── Country definition ───────────────────────────────────────────── */

export interface Country {
  /** ISO 3166-1 alpha-2 */
  code: CountryCode;
  /** Display name */
  name: string;
  /** International dial code (e.g. "+91") */
  dialCode: string;
  /** Flag emoji */
  flag: string;
  /** Phone validation rules for this country */
  phoneRule: PhoneRule;
}

/* ── Registry ─────────────────────────────────────────────────────── */

/**
 * Master list of supported countries.
 *
 * To add a new country:
 *   1. Add its code to `CountryCode` above.
 *   2. Add an entry here with the correct dial code, flag, and phone rule.
 *   That's it — the sign-in form, Zod schema, and InputGroup all adapt.
 */
export const COUNTRIES: Record<CountryCode, Country> = {
  [CountryCode.IN]: {
    code: CountryCode.IN,
    name: "India",
    dialCode: "+91",
    flag: "\u{1F1EE}\u{1F1F3}",
    phoneRule: {
      pattern: /^\d{10}$/,
      maxLength: 10,
      placeholder: "XXXXX XXXXX",
      errorMessage: "Enter a valid 10-digit Indian mobile number",
    },
  },

  // ── Future countries ──────────────────────────────────────────
  //
  // [CountryCode.US]: {
  //   code: CountryCode.US,
  //   name: "United States",
  //   dialCode: "+1",
  //   flag: "\u{1F1FA}\u{1F1F8}",
  //   phoneRule: {
  //     pattern: /^\d{10}$/,
  //     maxLength: 10,
  //     placeholder: "(XXX) XXX-XXXX",
  //     errorMessage: "Enter a valid 10-digit US phone number",
  //   },
  // },
  //
  // [CountryCode.AE]: {
  //   code: CountryCode.AE,
  //   name: "UAE",
  //   dialCode: "+971",
  //   flag: "\u{1F1E6}\u{1F1EA}",
  //   phoneRule: {
  //     pattern: /^\d{9}$/,
  //     maxLength: 9,
  //     placeholder: "XX XXX XXXX",
  //     errorMessage: "Enter a valid 9-digit UAE mobile number",
  //   },
  // },
};

/** Ordered list for dropdowns / selects. */
export const COUNTRY_LIST: Country[] = Object.values(COUNTRIES);

/** Default country used when the page first loads. */
export const DEFAULT_COUNTRY_CODE: CountryCode = CountryCode.IN;

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Look up a country by its code. */
export const getCountry = (code: CountryCode): Country => {
  return COUNTRIES[code];
};

/**
 * Build a Zod schema for the phone field that adapts to the
 * selected country's validation rules.
 */
export const buildPhoneSchema = (countryCode: CountryCode) => {
  const { phoneRule } = getCountry(countryCode);

  return z.object({
    phone: z
      .string()
      .min(1, "Mobile number is required")
      .regex(phoneRule.pattern, phoneRule.errorMessage),
  });
};

export type PhoneFormValues = z.infer<ReturnType<typeof buildPhoneSchema>>;
