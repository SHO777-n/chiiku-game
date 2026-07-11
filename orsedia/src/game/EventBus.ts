/**
 * React ⇔ Phaser の唯一の接点となる型付きイベントバス(ADR-004)。
 * どちらのフレームワークにも依存しない小さな実装。
 */

export interface GameEvents {
  'hp-changed': { hp: number; maxHp: number };
  'scene-changed': { scene: 'title' | 'game' | 'gameover' };
  'save-done': { savedAt: string };
}

type Listener<T> = (payload: T) => void;

class TypedEventBus {
  private listeners = new Map<keyof GameEvents, Set<Listener<never>>>();

  on<K extends keyof GameEvents>(event: K, listener: Listener<GameEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener as Listener<never>);
  }

  off<K extends keyof GameEvents>(event: K, listener: Listener<GameEvents[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<never>);
  }

  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      (listener as Listener<GameEvents[K]>)(payload);
    });
  }
}

export const eventBus = new TypedEventBus();
