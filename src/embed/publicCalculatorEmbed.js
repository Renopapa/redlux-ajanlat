import React from 'react';
import { createRoot } from 'react-dom/client';
import PublicCalculatorWidget from '../components/PublicCalculatorWidget';

/**
 * Inicializálja a publikus árajánlat kalkulátort egy adott konténerben.
 * Ezt a függvényt a bundle exportálja, hogy külső oldalak is használni tudják.
 *
 * Példa használat (pseudo-kód, bundlere építve):
 * window.initPublicQuoteCalculator('#my-quote-calculator', {
 *   primaryColor: '#e53535',
 *   accentColor: '#ffb347',
 *   borderRadius: 16,
 * });
 */
export function initPublicQuoteCalculator(containerOrSelector, options = {}) {
  let container = containerOrSelector;
  if (typeof containerOrSelector === 'string') {
    container = document.querySelector(containerOrSelector);
  }

  if (!container) {
    console.error('Public calculator container not found:', containerOrSelector);
    return;
  }

  const root = createRoot(container);
  root.render(<PublicCalculatorWidget {...options} />);
}

// Opcionálisan globálisra is kiexportáljuk, ha a bundle így kerül felhasználásra.
if (typeof window !== 'undefined') {
  window.initPublicQuoteCalculator = initPublicQuoteCalculator;
}

