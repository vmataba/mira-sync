/**
 * Formats a number with thousand separators (commas) and two decimal places
 * @param value - The number to format
 * @returns Formatted string with thousand separators and cents
 */
export function formatWithThousandSeparators(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Formats a number with abbreviated suffix (K, M, B) for large values
 * @param value - The number to format
 * @returns Abbreviated string with suffix (e.g., 3M, 1.5B, 500K)
 */
export function formatAbbreviated(value: number): string {
  const absValue = Math.abs(value)
  
  if (absValue >= 1_000_000_000) {
    // Billions
    return (value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B'
  } else if (absValue >= 1_000_000) {
    // Millions
    return (value / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M'
  } else if (absValue >= 1_000) {
    // Thousands
    return (value / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K'
  } else {
    // Less than 1000, show with 2 decimal places
    return value.toFixed(2).replace(/\.?0+$/, '')
  }
}

/**
 * Formats a monetary value with TZS currency
 * @param value - The number to format
 * @returns Formatted string with thousand separators and TZS suffix
 */
export function formatCurrency(value: number): string {
  return `${formatWithThousandSeparators(value)} TZS`
}

/**
 * Removes thousand separators from a string to get the raw number
 * @param value - The formatted string
 * @returns Number without separators
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/,/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Formats input value as user types (adds thousand separators)
 * @param value - The input string
 * @returns Formatted string with thousand separators
 */
export function formatInputValue(value: string): string {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '')
  
  // Split into integer and decimal parts
  const parts = cleaned.split('.')
  const integerPart = parts[0]
  let decimalPart = parts[1]
  
  // Limit decimal places to 2
  if (decimalPart !== undefined && decimalPart.length > 2) {
    decimalPart = decimalPart.substring(0, 2)
  }
  
  // Format integer part with thousand separators
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Rejoin with decimal if it exists
  return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted
}
