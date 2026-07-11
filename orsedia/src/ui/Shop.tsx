import { useEffect, useState, useSyncExternalStore } from 'react';
import { gameState } from '../game/systems/GameState';
import { items, shops } from '../game/data/items';
import { AudioSystem } from '../game/systems/AudioSystem';

/** ショップUI(NPC会話の「買い物をする」で開く)。 */
export function Shop() {
  const state = useSyncExternalStore(gameState.subscribe, gameState.getSnapshot);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!state.ui.shopId) return;
    setMode('buy');
    setMessage('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') gameState.closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.ui.shopId]);

  if (!state.ui.shopId) return null;
  const shop = shops[state.ui.shopId];
  if (!shop) return null;

  const sellables = state.inventory.filter((s) => (items[s.itemId]?.sellPrice ?? 0) > 0);

  return (
    <div className="overlay">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-tabs">
            <span className="shop-title">{shop.name}</span>
            <button className={mode === 'buy' ? 'tab active' : 'tab'} onClick={() => setMode('buy')}>
              買う
            </button>
            <button
              className={mode === 'sell' ? 'tab active' : 'tab'}
              onClick={() => setMode('sell')}
            >
              売る
            </button>
          </div>
          <button className="close-btn" onClick={() => gameState.closeMenu()}>
            ✕ 閉じる
          </button>
        </div>
        <div className="panel-stats">所持金: {state.gold} リン</div>
        {message && <div className="panel-message">{message}</div>}

        <div className="panel-body">
          {mode === 'buy' ? (
            <ul className="list">
              {shop.itemIds.map((id) => {
                const def = items[id];
                const affordable = state.gold >= def.buyPrice;
                return (
                  <li key={id} className={affordable ? '' : 'locked'}>
                    <span className="item-name">
                      {def.name} … {def.buyPrice}リン
                    </span>
                    <span className="item-desc">{def.description}</span>
                    <button
                      disabled={!affordable}
                      onClick={() => {
                        if (gameState.spendGold(def.buyPrice)) {
                          gameState.giveItem(id, 1);
                          AudioSystem.playSe('pickup');
                          setMessage(`${def.name}を買った`);
                        }
                      }}
                    >
                      買う
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="list">
              {sellables.length === 0 && <li className="muted">売れるものがない</li>}
              {sellables.map((stack, i) => {
                const def = items[stack.itemId];
                return (
                  <li key={`${stack.itemId}-${i}`}>
                    <span className="item-name">
                      {def.name} ×{stack.count} … {def.sellPrice}リン
                    </span>
                    <span className="item-desc">{def.description}</span>
                    <button
                      onClick={() => {
                        if (gameState.takeItem(stack.itemId, 1)) {
                          gameState.addGold(def.sellPrice);
                          AudioSystem.playSe('pickup');
                          setMessage(`${def.name}を売った(+${def.sellPrice}リン)`);
                        }
                      }}
                    >
                      売る
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
