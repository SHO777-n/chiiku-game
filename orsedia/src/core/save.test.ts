import { describe, expect, it } from 'vitest';
import { createSaveData, parseSave, serializeSave } from './save';

const player = { x: 100, y: 200, hp: 15, maxHp: 20 };

describe('save round-trip', () => {
  it('作成→直列化→パースで同じ内容に戻る', () => {
    const data = createSaveData(player, ['enemy-1'], new Date('2026-07-11T00:00:00Z'));
    const restored = parseSave(serializeSave(data));
    expect(restored).toEqual(data);
  });
});

describe('parseSave の検証', () => {
  it('null・空文字は null を返す', () => {
    expect(parseSave(null)).toBeNull();
    expect(parseSave('')).toBeNull();
    expect(parseSave(undefined)).toBeNull();
  });

  it('JSONとして壊れたデータは null を返す', () => {
    expect(parseSave('{oops')).toBeNull();
  });

  it('未知のバージョンは null を返す', () => {
    const data = { ...createSaveData(player, []), version: 99 };
    expect(parseSave(JSON.stringify(data))).toBeNull();
  });

  it('プレイヤー情報が欠けていると null を返す', () => {
    expect(parseSave(JSON.stringify({ version: 1, defeatedEnemyIds: [], savedAt: 'x' }))).toBeNull();
  });

  it('HPが範囲外なら null を返す', () => {
    const over = createSaveData({ ...player, hp: 25 }, []);
    expect(parseSave(JSON.stringify(over))).toBeNull();
    const negative = createSaveData({ ...player, hp: -1 }, []);
    expect(parseSave(JSON.stringify(negative))).toBeNull();
  });

  it('撃破敵IDに文字列以外が混ざると null を返す', () => {
    const data = { ...createSaveData(player, []), defeatedEnemyIds: [1, 2] };
    expect(parseSave(JSON.stringify(data))).toBeNull();
  });
});
