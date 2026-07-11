import { describe, expect, it } from 'vitest';
import { maps } from './maps';
import { parseMap, isWalkable } from '../../core/map';
import { npcs } from './npcs';
import { enemyDefinitions } from './enemies';

describe('全マップの整合性', () => {
  Object.entries(maps).forEach(([id, def]) => {
    it(`${id}: パースでき、行長が揃っている`, () => {
      expect(() => parseMap(def.rows)).not.toThrow();
    });

    it(`${id}: スポーン地点が歩行可能`, () => {
      const cells = parseMap(def.rows);
      expect(isWalkable(cells, def.playerSpawn.col, def.playerSpawn.row)).toBe(true);
    });

    it(`${id}: ポータルの行き先マップと座標が有効`, () => {
      def.portals.forEach((p) => {
        const target = maps[p.target.mapId];
        expect(target, `${id}→${p.target.mapId}`).toBeDefined();
        const cells = parseMap(target.rows);
        expect(
          isWalkable(cells, p.target.col, p.target.row),
          `${id}→${p.target.mapId} (${p.target.col},${p.target.row})`,
        ).toBe(true);
      });
    });

    it(`${id}: 敵スポーンの種類と座標が有効`, () => {
      const cells = parseMap(def.rows);
      def.enemySpawns.forEach((s) => {
        expect(enemyDefinitions[s.type], s.type).toBeDefined();
        expect(isWalkable(cells, s.col, s.row), `${s.id} (${s.col},${s.row})`).toBe(true);
        expect(isWalkable(cells, s.patrolTo.col, s.patrolTo.row), `${s.id} patrolTo`).toBe(true);
      });
    });
  });

  it('NPCの配置マップと座標が有効', () => {
    npcs.forEach((n) => {
      const def = maps[n.mapId];
      expect(def, `${n.id} → ${n.mapId}`).toBeDefined();
      const cells = parseMap(def.rows);
      expect(isWalkable(cells, n.col, n.row), `${n.id} (${n.col},${n.row})`).toBe(true);
      if (n.night) {
        expect(isWalkable(cells, n.night.col, n.night.row), `${n.id} night`).toBe(true);
      }
    });
  });

  it('羊スポットが歩行可能', () => {
    const forest = maps.forest;
    const cells = parseMap(forest.rows);
    forest.sheepSpots?.forEach((s, i) => {
      expect(isWalkable(cells, s.col, s.row), `sheep${i}`).toBe(true);
    });
  });
});
