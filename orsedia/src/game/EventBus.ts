/**
 * React ⇔ Phaser のイベント連絡路(ADR-004 / ADR-007)。
 * 進行状態そのものは systems/GameState が持ち、ここは通知・命令のみを流す。
 */

export interface GameEvents {
  'scene-changed': { scene: 'title' | 'game' | 'gameover' | 'ending' };
  notify: { message: string };
  'save-done': { savedAt: string };
  /** React側UIを閉じた時にPhaserへフォーカスを返す */
  'ui-closed': Record<string, never>;
}

type Listener<T> = (payload: T) => void;

class TypedEventBus {
  private listeners = new Map<keyof GameEvents, Set<Listener<never>>>();

  on<K extends keyof GameEvents>(event: K, listener: Listener<GameEvents[K]>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
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
