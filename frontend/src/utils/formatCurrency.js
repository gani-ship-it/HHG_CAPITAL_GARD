/**
 * Formats values into institutional currency notations (INR Cr, INR Lakh, USD)
 */

export function formatCurrency(amount, currency = "INR", precision = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";

  const num = Number(amount);

  if (currency === "INR") {
    // 1 Crore = 10,000,000 (10^7)
    if (Math.abs(num) >= 10000000) {
      const cr = num / 10000000;
      return `₹${cr.toLocaleString("en-IN", { minimumFractionDigits: precision, maximumFractionDigits: precision })} Cr`;
    }
    // 1 Lakh = 100,000 (10^5)
    if (Math.abs(num) >= 100000) {
      const lakh = num / 100000;
      return `₹${lakh.toLocaleString("en-IN", { minimumFractionDigits: precision, maximumFractionDigits: precision })} Lakh`;
    }
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: precision, maximumFractionDigits: precision })}`;
  }

  // Fallback for other currencies (USD, EUR, GBP)
  const symbols = { USD: "$", EUR: "€", GBP: "£" };
  const sym = symbols[currency] || `${currency} `;
  
  if (Math.abs(num) >= 1000000000) {
    return `${sym}${(num / 1000000000).toFixed(precision)}B`;
  }
  if (Math.abs(num) >= 1000000) {
    return `${sym}${(num / 1000000).toFixed(precision)}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `${sym}${(num / 1000).toFixed(precision)}k`;
  }

  return `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}`;
}

export function formatCroresOnly(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return (Number(amount) / 10000000).toFixed(2);
}
