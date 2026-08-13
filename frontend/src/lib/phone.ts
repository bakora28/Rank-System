export const EGYPT_PHONE_REGEX = /^01[0125]\d{8}$/;

export function isValidEgyptianPhone(value: string): boolean {
  return EGYPT_PHONE_REGEX.test(value);
}
