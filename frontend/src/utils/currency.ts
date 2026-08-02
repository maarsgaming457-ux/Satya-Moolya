/**
 * Formats a given number as Indian Rupees (INR)
 * Example: 150000 -> ₹1,50,000
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // Removes decimal places for clean UI (e.g., ₹1,25,000 instead of ₹1,25,000.00)
  }).format(amount);
}
