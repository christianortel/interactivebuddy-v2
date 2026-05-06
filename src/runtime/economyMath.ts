export function getGiftCost(cash: number): number {
  return Math.min(25, Math.max(5, Math.round(cash * 0.04)));
}
