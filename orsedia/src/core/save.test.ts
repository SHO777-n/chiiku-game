import { describe, expect, it } from 'vitest';
import { parseSave, serializeSave, type SaveDataV2 } from './save';

function sampleSave(): SaveDataV2 {
  return {
    version: 2,
    mapId: 'village',
    player: { x: 100, y: 200, hp: 15, mp: 8, level: 3, xp: 60, skillPoints: 1 },
    learnedSkills: ['powerStrike'],
    equipment: { weapon: 'echoBlade', armor: null, charm: null },
    inventory: [{ itemId: 'potion', count: 3 }],
    gold: 120,
    flags: { mq1Done: true, towerChoice: 'seal' },
    quests: [{ id: 'mq1', status: 'rewarded', counts: { investigate: 1 } }],
    defeatedEnemyIds: ['shard-1'],
    clockMin: 480,
    savedAt: '2026-07-11T00:00:00.000Z',
  };
}

describe('save v2 round-trip', () => {
  it('直列化→パースで同じ内容に戻る', () => {
    const data = sampleSave();
    expect(parseSave(serializeSave(data))).toEqual(data);
  });
});

describe('parseSave の検証', () => {
  it('null・空文字・壊れたJSONは null', () => {
    expect(parseSave(null)).toBeNull();
    expect(parseSave('')).toBeNull();
    expect(parseSave('{oops')).toBeNull();
  });

  it('未知のバージョンは null', () => {
    expect(parseSave(JSON.stringify({ ...sampleSave(), version: 99 }))).toBeNull();
  });

  it('インベントリの数値破損は null', () => {
    const bad = { ...sampleSave(), inventory: [{ itemId: 'potion', count: 'many' }] };
    expect(parseSave(JSON.stringify(bad))).toBeNull();
  });

  it('クエスト状態の破損は null', () => {
    const bad = { ...sampleSave(), quests: [{ id: 'mq1', status: 'weird', counts: {} }] };
    expect(parseSave(JSON.stringify(bad))).toBeNull();
  });
});

describe('v1 からのマイグレーション', () => {
  it('位置・HP・撃破記録を引き継ぎ、他は初期値になる', () => {
    const v1 = {
      version: 1,
      player: { x: 112, y: 496, hp: 12, maxHp: 20 },
      defeatedEnemyIds: ['shard-1'],
      savedAt: '2026-07-11T00:00:00.000Z',
    };
    const migrated = parseSave(JSON.stringify(v1));
    expect(migrated).not.toBeNull();
    expect(migrated?.version).toBe(2);
    expect(migrated?.player).toMatchObject({ x: 112, y: 496, hp: 12, level: 1 });
    expect(migrated?.defeatedEnemyIds).toEqual(['shard-1']);
    expect(migrated?.mapId).toBe('forest');
  });
});
