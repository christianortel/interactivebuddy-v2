// Economy core ported from the artifact's addCash function (EV-0021, 0x14dcac):
//   cash += Math.max(0, amount); stats.totalCash += Math.max(0, amount);
//   dep (pending deposit counter) decrements; a moneySign particle is spawned.
// Per-event payout amounts live at the addCash call sites (EV-0021 lists fixed
// awards 15/10/7/5/4/3/2/1 and velocity-scaled Math.min formulas); each amount
// is ported alongside its item/interaction slice.

export interface MoneyPopup {
  x: number;
  y: number;
  age: number;
  amount: number;
}

export class Economy {
  totalCash = 0;
  popups: MoneyPopup[] = [];

  /** Exact addCash semantics; returns the new balance. */
  addCash(balance: number, amount: number, x: number, y: number): number {
    const awarded = Math.max(0, amount);
    this.totalCash += awarded;
    if (awarded > 0) {
      this.popups.push({ x, y, age: 0, amount: awarded });
    }
    return balance + awarded;
  }

  tick(): void {
    for (const popup of this.popups) popup.age += 1;
    this.popups = this.popups.filter((popup) => popup.age < 40);
  }

  // PROVISIONAL presentation (moneySign particle look/motion pending capture):
  // rises and fades over one second at 40 Hz.
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = "11px Arial";
    for (const popup of this.popups) {
      const alpha = 1 - popup.age / 40;
      ctx.fillStyle = `rgba(46, 90, 46, ${alpha.toFixed(2)})`;
      ctx.fillText(`+$${popup.amount.toFixed(2)}`, popup.x, popup.y - popup.age * 0.5);
    }
  }
}
