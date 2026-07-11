/** インベントリ操作(純粋ロジック)。すべて新しい配列を返す。 */

export interface ItemStack {
  itemId: string;
  count: number;
}

export const MAX_STACK = 99;

export function countItem(inv: ItemStack[], itemId: string): number {
  return inv.filter((s) => s.itemId === itemId).reduce((sum, s) => sum + s.count, 0);
}

export function addItem(inv: ItemStack[], itemId: string, count = 1): ItemStack[] {
  let remaining = count;
  const next = inv.map((s) => {
    if (s.itemId !== itemId || s.count >= MAX_STACK || remaining <= 0) return s;
    const take = Math.min(MAX_STACK - s.count, remaining);
    remaining -= take;
    return { ...s, count: s.count + take };
  });
  while (remaining > 0) {
    const take = Math.min(MAX_STACK, remaining);
    next.push({ itemId, count: take });
    remaining -= take;
  }
  return next;
}

/** 足りない場合は null を返す(部分消費しない)。 */
export function removeItem(inv: ItemStack[], itemId: string, count = 1): ItemStack[] | null {
  if (countItem(inv, itemId) < count) return null;
  let remaining = count;
  const next: ItemStack[] = [];
  for (const s of inv) {
    if (s.itemId !== itemId || remaining <= 0) {
      next.push(s);
      continue;
    }
    const take = Math.min(s.count, remaining);
    remaining -= take;
    if (s.count - take > 0) next.push({ ...s, count: s.count - take });
  }
  return next;
}
