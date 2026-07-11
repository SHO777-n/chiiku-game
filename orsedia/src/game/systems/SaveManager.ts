import {
  createSaveData,
  parseSave,
  serializeSave,
  type SaveDataV1,
  type SavePlayerState,
} from '../../core/save';
import { SAVE_STORAGE_KEY } from '../config';

/**
 * localStorage への保存・読込。検証は core/save に委譲する。
 * localStorage が使えない環境(プライベートモード等)でも例外で落とさない。
 */
export const SaveManager = {
  save(player: SavePlayerState, defeatedEnemyIds: string[]): SaveDataV1 | null {
    const data = createSaveData(player, defeatedEnemyIds);
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, serializeSave(data));
      return data;
    } catch {
      return null;
    }
  },

  load(): SaveDataV1 | null {
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
