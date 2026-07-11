/** クラフト(純粋ロジック)。 */
import { countItem, removeItem, addItem, type ItemStack } from './inventory';

export interface RecipeDef {
  id: string;
  name: string;
  result: { itemId: string; count: number };
  materials: { itemId: string; count: number }[];
}

export function canCraft(recipe: RecipeDef, inv: ItemStack[]): boolean {
  return recipe.materials.every((m) => countItem(inv, m.itemId) >= m.count);
}

/** 素材を消費して成果物を加える。素材不足なら null。 */
export function craft(recipe: RecipeDef, inv: ItemStack[]): ItemStack[] | null {
  let next: ItemStack[] | null = inv;
  for (const m of recipe.materials) {
    next = removeItem(next, m.itemId, m.count);
    if (!next) return null;
  }
  return addItem(next, recipe.result.itemId, recipe.result.count);
}
