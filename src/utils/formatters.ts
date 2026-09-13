/**
 * Currency and date formatting utilities for Pakistan regional standards (PKR / Rs.)
 */

export function formatPKR(amount: number, prefix: 'Rs.' | 'PKR' = 'Rs.'): string {
  const numericAmount = isNaN(amount) ? 0 : amount;
  // Pakistani locale standard formatting
  const formattedNumber = numericAmount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${prefix} ${formattedNumber}`;
}

export function formatPKRCode(amount: number): string {
  return formatPKR(amount, 'PKR');
}

export function formatNumber(amount: number): string {
  const numericAmount = isNaN(amount) ? 0 : amount;
  return numericAmount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDatePK(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

export function formatShortDatePK(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
