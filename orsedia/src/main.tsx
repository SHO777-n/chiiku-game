import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { gameState } from './game/systems/GameState';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root 要素が見つかりません');
}

// E2Eテスト・デバッグ用フック(進行状態の観測に使う)
(window as unknown as Record<string, unknown>).__orsedia = { gameState };

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
