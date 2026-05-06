export interface UiState {
  moneyText: string;
  selectedToolName: string;
  comboText: string;
}

export function formatMoney(value: number): string {
  return `$${Math.max(0, Math.floor(value)).toLocaleString()}`;
}
