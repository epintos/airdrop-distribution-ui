export function formatTokenAmount(weiAmount: number, decimals: number): string {
  if (isNaN(weiAmount) || isNaN(decimals)) {
    return "0.00";
  }
  const tokenAmount = weiAmount / Math.pow(10, decimals)
  return tokenAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
