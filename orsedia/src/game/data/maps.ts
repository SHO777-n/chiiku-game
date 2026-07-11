/**
 * マップデータ(ロジック禁止)。
 * このファイルは tools/genmaps.mjs により生成される。直接編集せず、
 * ジェネレータを編集して `node tools/genmaps.mjs` で再生成すること。
 */

export const TILE_SIZE = 32;

export interface PortalDef {
  col: number;
  row: number;
  width: number;
  height: number;
  target: { mapId: string; col: number; row: number };
  requiresFlag?: string;
  lockedMessage?: string;
}

export interface EnemySpawnDef {
  id: string;
  type: string;
  col: number;
  row: number;
  patrolTo: { col: number; row: number };
}

export interface MapDef {
  name: string;
  outdoor: boolean;
  music: string;
  playerSpawn: { col: number; row: number };
  rows: string[];
  portals: PortalDef[];
  enemySpawns: EnemySpawnDef[];
  sheepSpots?: { col: number; row: number }[];
}

export const maps: Record<string, MapDef> = {
  "village": {
    "name": "ハルベナ村",
    "outdoor": true,
    "music": "village",
    "playerSpawn": {
      "col": 5,
      "row": 9
    },
    "rows": [
      "############################",
      "#.,....rrrrr....rrrrr....,.#",
      "#......WWWWW....WWWWW......#",
      "#......WWDWW....WWDWW......#",
      "#........:........:........#",
      "#...L....:........:....L.,.#",
      "#..,.....:........:........#",
      "#........:........:.....,..#",
      "#........:........:........#",
      "#:::::::::::::::::::::::::::",
      "#..........................#",
      "#..........................#",
      "#..rrrrrr....~~~~....rrrrr.#",
      "#..WWWWWW....~~~~....WWWWW.#",
      "#..WWWDWW............WWDWW.#",
      "#.....:................:...#",
      "#...H.:.....,.......,..:H..#",
      "#.,.....L..........L.......#",
      "#,........................,#",
      "############################"
    ],
    "portals": [
      {
        "col": 27,
        "row": 9,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "forest",
          "col": 2,
          "row": 12
        }
      }
    ],
    "enemySpawns": []
  },
  "forest": {
    "name": "躁ぎの森",
    "outdoor": true,
    "music": "field",
    "playerSpawn": {
      "col": 2,
      "row": 12
    },
    "rows": [
      "####################################",
      "#..............sssss..~~...........#",
      "#..............ssGss..~~...........#",
      "#...####.........:....~~...#####...#",
      "#...####R........:....~~...#####...#",
      "#.....,..........:....~~...........#",
      "#.........###....:....~~....,,,....#",
      "#.........###....:....~~....,E,....#",
      "#....o..H.###....:....~~.,..,,,....#",
      "#..R........,....:....~~...........#",
      "#................:....~~.....H.....#",
      "#................:....~~...........#",
      "::::::::::::::::::::::::::::::::::::",
      "#.....................~~...........#",
      "#.....................~~........R..#",
      "#.....H......###......~~...........#",
      "#............###....,.~~..H........#",
      "#....###..............~~......####.#",
      "#..o.###......H.......~~....,.####.#",
      "#....###.,............~~......####.#",
      "#.....................~~..R........#",
      "#...........o.........~~.......o...#",
      "#.....................~~...........#",
      "####################################"
    ],
    "sheepSpots": [
      {
        "col": 9,
        "row": 5
      },
      {
        "col": 28,
        "row": 20
      },
      {
        "col": 32,
        "row": 8
      }
    ],
    "portals": [
      {
        "col": 0,
        "row": 12,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "village",
          "col": 26,
          "row": 9
        }
      },
      {
        "col": 35,
        "row": 12,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "road",
          "col": 1,
          "row": 5
        },
        "requiresFlag": "roadOpen",
        "lockedMessage": "街道は封鎖されている。今は村の異変が先だ。"
      },
      {
        "col": 17,
        "row": 1,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "tower",
          "col": 13,
          "row": 20
        },
        "requiresFlag": "towerOpen",
        "lockedMessage": "扉は古代の封で閉ざされている。強い共鳴が要る。"
      }
    ],
    "enemySpawns": [
      {
        "id": "f-shard-1",
        "type": "echoShard",
        "col": 8,
        "row": 6,
        "patrolTo": {
          "col": 14,
          "row": 6
        }
      },
      {
        "id": "f-shard-2",
        "type": "echoShard",
        "col": 27,
        "row": 14,
        "patrolTo": {
          "col": 31,
          "row": 12
        }
      },
      {
        "id": "f-shard-3",
        "type": "echoShard",
        "col": 10,
        "row": 16,
        "patrolTo": {
          "col": 10,
          "row": 20
        }
      },
      {
        "id": "f-wolf-1",
        "type": "shadowWolf",
        "col": 26,
        "row": 4,
        "patrolTo": {
          "col": 33,
          "row": 6
        }
      },
      {
        "id": "f-wolf-2",
        "type": "shadowWolf",
        "col": 5,
        "row": 20,
        "patrolTo": {
          "col": 12,
          "row": 20
        }
      }
    ]
  },
  "tower": {
    "name": "眠らぬ鐘楼",
    "outdoor": false,
    "music": "dungeon",
    "playerSpawn": {
      "col": 13,
      "row": 20
    },
    "rows": [
      "SSSSSSSSSSSSSSSSSSSSSSSSSS",
      "S__ssssssssssssssssssss__S",
      "S__ssssssssssssssssssss__S",
      "S__ssssssssssssssssssss__S",
      "S__sLssssssssssssssssLs__S",
      "S__ssssssssssssssssssss__S",
      "S__SSSSSSSSSSGSSSSSSSSS__S",
      "S__ssssssssssssssssssss__S",
      "S__ssssssssssssssssssss__S",
      "S__ssSSSSSSSSsssSSSSSss__S",
      "S__ssssssssssssssssssss__S",
      "S__ssssssssssssssssssss__S",
      "S__ssssssssssSSSSSSSSss__S",
      "S__sssOssssssssssssssss__S",
      "S__ssssssssssssssssssss__S",
      "S__ssSSSSSSSSssssssssss__S",
      "S__ssssssssssssssssOsss__S",
      "S__ssssssssssssssssssss__S",
      "S__sssssSSSSSSSSSSsssss__S",
      "S__ssssssssssssssssssss__S",
      "S__ssssssssssssssssssss__S",
      "SSSSSSSSSSSSSsSSSSSSSSSSSS"
    ],
    "portals": [
      {
        "col": 13,
        "row": 21,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "forest",
          "col": 17,
          "row": 3
        }
      }
    ],
    "enemySpawns": [
      {
        "id": "t-sent-1",
        "type": "stoneSentinel",
        "col": 7,
        "row": 11,
        "patrolTo": {
          "col": 11,
          "row": 11
        }
      },
      {
        "id": "t-sent-2",
        "type": "stoneSentinel",
        "col": 17,
        "row": 14,
        "patrolTo": {
          "col": 17,
          "row": 17
        }
      },
      {
        "id": "t-sent-3",
        "type": "stoneSentinel",
        "col": 9,
        "row": 17,
        "patrolTo": {
          "col": 5,
          "row": 17
        }
      },
      {
        "id": "t-shard-1",
        "type": "echoShard",
        "col": 19,
        "row": 8,
        "patrolTo": {
          "col": 14,
          "row": 8
        }
      },
      {
        "id": "t-shard-2",
        "type": "echoShard",
        "col": 6,
        "row": 8,
        "patrolTo": {
          "col": 10,
          "row": 8
        }
      },
      {
        "id": "boss-wailing",
        "type": "wailingEcho",
        "col": 13,
        "row": 3,
        "patrolTo": {
          "col": 13,
          "row": 3
        }
      }
    ]
  },
  "road": {
    "name": "王国街道",
    "outdoor": true,
    "music": "field",
    "playerSpawn": {
      "col": 1,
      "row": 5
    },
    "rows": [
      "####################################",
      "#............###...................#",
      "#.......R....###.............R.....#",
      "#...,......H...............,.......#",
      "#..................................#",
      "::::::L:::::::::::::::::::::::L:::::",
      "::::::::::::::::::L:::::::::::::::::",
      "#..................................#",
      "#.......................H........,.#",
      "#..............,....R.###..........#",
      "#.....................###..........#",
      "####################################"
    ],
    "portals": [
      {
        "col": 0,
        "row": 5,
        "width": 1,
        "height": 2,
        "target": {
          "mapId": "forest",
          "col": 34,
          "row": 12
        }
      },
      {
        "col": 35,
        "row": 5,
        "width": 1,
        "height": 2,
        "target": {
          "mapId": "town",
          "col": 1,
          "row": 10
        }
      }
    ],
    "enemySpawns": [
      {
        "id": "r-wolf-1",
        "type": "shadowWolf",
        "col": 10,
        "row": 3,
        "patrolTo": {
          "col": 16,
          "row": 3
        }
      },
      {
        "id": "r-wolf-2",
        "type": "shadowWolf",
        "col": 20,
        "row": 8,
        "patrolTo": {
          "col": 27,
          "row": 8
        }
      },
      {
        "id": "r-wolf-3",
        "type": "shadowWolf",
        "col": 30,
        "row": 3,
        "patrolTo": {
          "col": 33,
          "row": 6
        }
      }
    ]
  },
  "town": {
    "name": "街ヴェルディン",
    "outdoor": true,
    "music": "town",
    "playerSpawn": {
      "col": 1,
      "row": 10
    },
    "rows": [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W:::::::::rrrrrrrr:::::::::W",
      "W:,:::::::WWWWWWWW:::::::::W",
      "W:::::::::WWWWWWWW:::::::::W",
      "W::rrrrr::WWWDWWWW:::::::::W",
      "W::WWWWW:::ssssss:::rrrrr::W",
      "W::WWDWW::::::::::::WWWWW::W",
      "W:::::::::::::::::::WWDWW::W",
      "W::::::::::::::::::::::::::W",
      "W:::::::L::::::::::L:::::::W",
      "::::::::::::~~~~:::::::::::W",
      "W:::::::::::~~~~:::::::::::W",
      "W::rrrrr::::::::::::rrrrr::W",
      "W::WWWWW::::::::::::WWWWW::W",
      "W::WWDWW::::::::::::WWDWW::W",
      "W::::::::::::::::::::::::::W",
      "W:::::::L::::::::::L:::::::W",
      "W:,::::::::::::::::::::::,:W",
      "W::::::::::::::::::::::::::W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ],
    "portals": [
      {
        "col": 0,
        "row": 10,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "road",
          "col": 34,
          "row": 5
        }
      },
      {
        "col": 13,
        "row": 4,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "crypt",
          "col": 2,
          "row": 3
        },
        "requiresFlag": "cryptOpen",
        "lockedMessage": "聖堂の地下への扉は固く閉ざされている。"
      }
    ],
    "enemySpawns": []
  },
  "crypt": {
    "name": "地下聖堂",
    "outdoor": false,
    "music": "dungeon",
    "playerSpawn": {
      "col": 2,
      "row": 3
    },
    "rows": [
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
      "S____________________________S",
      "SsssssssssssssssssssSssssssssS",
      "SssLssssssssssssssssSssssssssS",
      "SsssssssssssssssssssSssssssssS",
      "SsssSSSSSSSSSSssSsssSssssssssS",
      "SsssssssssssssssSsssSssssssssS",
      "SsssssssssOsssssSsssSssssssssS",
      "SsssssssssssssssSsssSssssssssS",
      "SsssssssSSSSSSSSSsssSssssssssS",
      "SsssssssssssssssssssGssssssssS",
      "SsssssssssssssssssssSssssssssS",
      "SsssssssssssssssssssSssssssssS",
      "SsssSSSSSSSSSSssssssSssssssssS",
      "SsssssssssssssssssssSssssssssS",
      "SsssssssssssssOssLssSssssssssS",
      "SsssssSSSSSSSSSSSSssSssssssssS",
      "SsssssssssssssssssssSssssssssS",
      "SssssssssssssssssssssssssssssS",
      "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
    ],
    "portals": [
      {
        "col": 2,
        "row": 2,
        "width": 1,
        "height": 1,
        "target": {
          "mapId": "town",
          "col": 13,
          "row": 5
        }
      }
    ],
    "enemySpawns": [
      {
        "id": "c-wraith-1",
        "type": "cryptWraith",
        "col": 7,
        "row": 7,
        "patrolTo": {
          "col": 13,
          "row": 7
        }
      },
      {
        "id": "c-wraith-2",
        "type": "cryptWraith",
        "col": 12,
        "row": 11,
        "patrolTo": {
          "col": 17,
          "row": 11
        }
      },
      {
        "id": "c-wraith-3",
        "type": "cryptWraith",
        "col": 6,
        "row": 15,
        "patrolTo": {
          "col": 12,
          "row": 15
        }
      },
      {
        "id": "c-wraith-4",
        "type": "cryptWraith",
        "col": 17,
        "row": 3,
        "patrolTo": {
          "col": 13,
          "row": 3
        }
      },
      {
        "id": "boss-enforcer",
        "type": "enforcer",
        "col": 25,
        "row": 10,
        "patrolTo": {
          "col": 25,
          "row": 10
        }
      }
    ]
  }
};
