export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}
