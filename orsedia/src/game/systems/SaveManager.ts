import { parseSave, serializeSave, type SaveDataV2 } from '../../core/save';
import { SAVE_STORAGE_KEY } from '../config';

/**
 * localStorage への保存・読込。検証・マイグレーションは core/save に委譲する。
 * localStorage が使えない環境でも例外で落とさない。
 */
export const SaveManager = {
  save(data: SaveDataV2): boolean {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, serializeSave(data));
      return true;
    } catch {
      return false;
    }
  },

  load(): SaveDataV2 | null {
    try {
      return parseSave(localStorage.getItem(SAVE_STORAGE_KEY));
    } catch {
      return null;
    }
  },

  hasSave(): boolean {
    return this.load() !== null;
  },
};
