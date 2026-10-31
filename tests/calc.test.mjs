import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAmount,
  calculateLineSubtotal,
  calculateSectionSubtotal,
  calculateBudgetTotals,
  formatCurrency
} from '../src/js/calc.js';

test('parseAmount - sanitiza correctamente montos de distintas fuentes', () => {
  assert.equal(parseAmount(280000), 280000);
  assert.equal(parseAmount('$ 280.000'), 280000);
  assert.equal(parseAmount('$280.000,50'), 280000.5);
  assert.equal(parseAmount('USD 1,500.25'), 1500.25);
  assert.equal(parseAmount('incluido'), 0);
  assert.equal(parseAmount(null), 0);
  assert.equal(parseAmount(-500), 0); // No permite montos negativos
});

test('calculateLineSubtotal - calcula cantidad por precio unitario', () => {
  assert.equal(calculateLineSubtotal(2, 280000), 560000);
  assert.equal(calculateLineSubtotal(4, '$ 45.000'), 180000);
  assert.equal(calculateLineSubtotal(1.5, 20000), 30000);
  assert.equal(calculateLineSubtotal(0, 50000), 0);
  assert.equal(calculateLineSubtotal(-3, 10000), 0);
});

test('calculateSectionSubtotal - suma líneas de ítems de una sección', () => {
  const items = [
    { quantity: 1, unitPrice: 280000 },
    { quantity: 2, unitPrice: 45000 },
    { amount: 15000 } // ítem con amount directo
  ];
  assert.equal(calculateSectionSubtotal(items), 385000);
  assert.equal(calculateSectionSubtotal([]), 0);
  assert.equal(calculateSectionSubtotal(null), 0);
});

test('calculateBudgetTotals - calcula subtotal, descuento, impuesto y anticipo', () => {
  const totals = calculateBudgetTotals({
    subtotal: 100000,
    discountPercent: 10,  // 10% descuento = -10.000 -> 90.000
    taxPercent: 21,       // 21% IVA sobre 90.000 = +18.900 -> 108.900
    anticipoPercent: 50   // 50% anticipo = 54.450 -> saldo = 54.450
  });

  assert.equal(totals.subtotal, 100000);
  assert.equal(totals.discountPercent, 10);
  assert.equal(totals.discountAmount, 10000);
  assert.equal(totals.subtotalWithDiscount, 90000);
  assert.equal(totals.taxPercent, 21);
  assert.equal(totals.taxAmount, 18900);
  assert.equal(totals.grandTotal, 108900);
  assert.equal(totals.anticipoPercent, 50);
  assert.equal(totals.anticipoAmount, 54450);
  assert.equal(totals.saldoAmount, 54450);
});

test('calculateBudgetTotals - valores por defecto sin descuento ni impuesto', () => {
  const totals = calculateBudgetTotals({ subtotal: 500000 });
  assert.equal(totals.subtotal, 500000);
  assert.equal(totals.discountAmount, 0);
  assert.equal(totals.taxAmount, 0);
  assert.equal(totals.grandTotal, 500000);
  assert.equal(totals.anticipoAmount, 250000);
  assert.equal(totals.saldoAmount, 250000);
});

test('formatCurrency - formatea correctamente en ARS y USD', () => {
  // Formato ARS usa puntos para miles
  const formattedArs = formatCurrency(280000, 'ARS');
  assert.match(formattedArs, /^\$\s*280\.000/);

  // Formato USD usa comas para miles
  const formattedUsd = formatCurrency(1250, 'USD');
  assert.equal(formattedUsd, 'USD 1,250');

  // Decimales
  const formattedDec = formatCurrency(1250.5, 'USD', true);
  assert.equal(formattedDec, 'USD 1,250.50');
});
