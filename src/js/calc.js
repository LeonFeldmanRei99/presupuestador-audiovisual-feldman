/**
 * Módulo de Cálculo Financiero y Formato de Moneda
 * Lógica pura sin dependencias de DOM ni librerías externas.
 */

/**
 * Parsea un valor monetario o número a float positivo seguro.
 * Soporta números, strings con formato argentino "$ 280.000", comas decimales, etc.
 * @param {number|string} val
 * @returns {number}
 */
export function parseAmount(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.max(0, val);
  }
  const clean = String(val)
    .replace(/[^\d.,-]/g, '')
    .trim();
  if (!clean) return 0;

  // Manejo de separadores: formato argentino 280.000,50 o internacional 280,000.50
  let normalized = clean;
  if (clean.includes('.') && clean.includes(',')) {
    // Si el punto viene antes de la coma: formato ARS 1.250,50
    if (clean.indexOf('.') < clean.indexOf(',')) {
      normalized = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,250.50
      normalized = clean.replace(/,/g, '');
    }
  } else if (clean.includes('.')) {
    // Si tiene un punto y luego 3 dígitos al final (ej 280.000), es separador de miles
    const parts = clean.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      normalized = clean.replace(/\./g, '');
    } else {
      normalized = clean;
    }
  } else if (clean.includes(',')) {
    // 250,50 -> decimal
    normalized = clean.replace(',', '.');
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Calcula el subtotal de una línea de ítem (cantidad * precio unitario).
 * @param {number|string} quantity
 * @param {number|string} unitPrice
 * @returns {number}
 */
export function calculateLineSubtotal(quantity, unitPrice) {
  const qty = Math.max(0, parseFloat(quantity) || 0);
  const price = parseAmount(unitPrice);
  return Math.round(qty * price * 100) / 100;
}

/**
 * Calcula el subtotal sumando una lista de ítems.
 * @param {Array<{quantity?: number|string, unitPrice?: number|string, amount?: number|string}>} items
 * @returns {number}
 */
export function calculateSectionSubtotal(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!item) return sum;
    // Si el ítem define quantity y unitPrice, se calcula; si no, toma amount directo
    const lineTotal = (item.quantity !== undefined && item.unitPrice !== undefined)
      ? calculateLineSubtotal(item.quantity, item.unitPrice)
      : parseAmount(item.amount);
    return sum + lineTotal;
  }, 0);
}

/**
 * Calcula los totales consolidados de un presupuesto.
 * @param {Object} params
 * @param {number} params.subtotal - Suma bruta de todas las secciones financieras
 * @param {number} [params.discountPercent=0] - Porcentaje de descuento (0 a 100)
 * @param {number} [params.taxPercent=0] - Porcentaje de impuestos / IVA (ej. 21)
 * @param {number} [params.anticipoPercent=50] - Porcentaje de anticipo inicial (ej. 50)
 * @returns {{
 *   subtotal: number,
 *   discountPercent: number,
 *   discountAmount: number,
 *   subtotalWithDiscount: number,
 *   taxPercent: number,
 *   taxAmount: number,
 *   grandTotal: number,
 *   anticipoPercent: number,
 *   anticipoAmount: number,
 *   saldoAmount: number
 * }}
 */
export function calculateBudgetTotals({
  subtotal = 0,
  discountPercent = 0,
  taxPercent = 0,
  anticipoPercent = 50
} = {}) {
  const safeSubtotal = Math.max(0, parseFloat(subtotal) || 0);
  const safeDiscPct = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
  const safeTaxPct = Math.max(0, parseFloat(taxPercent) || 0);
  const safeAnticipoPct = Math.min(100, Math.max(0, parseFloat(anticipoPercent) || 0));

  // Descuento
  const discountAmount = Math.round((safeSubtotal * (safeDiscPct / 100)) * 100) / 100;
  const subtotalWithDiscount = Math.max(0, safeSubtotal - discountAmount);

  // Impuesto sobre el monto con descuento
  const taxAmount = Math.round((subtotalWithDiscount * (safeTaxPct / 100)) * 100) / 100;

  // Total General
  const grandTotal = Math.round((subtotalWithDiscount + taxAmount) * 100) / 100;

  // Anticipo y Saldo
  const anticipoAmount = Math.round((grandTotal * (safeAnticipoPct / 100)) * 100) / 100;
  const saldoAmount = Math.max(0, Math.round((grandTotal - anticipoAmount) * 100) / 100);

  return {
    subtotal: safeSubtotal,
    discountPercent: safeDiscPct,
    discountAmount,
    subtotalWithDiscount,
    taxPercent: safeTaxPct,
    taxAmount,
    grandTotal,
    anticipoPercent: safeAnticipoPct,
    anticipoAmount,
    saldoAmount
  };
}

/**
 * Formatea un número en moneda ARS o USD.
 * @param {number|string} amount
 * @param {string} [currency='ARS'] - 'ARS' | 'USD'
 * @param {boolean} [showDecimals=false] - Forzar decimales si existen
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'ARS', showDecimals = false) {
  const num = parseAmount(amount);
  const curr = String(currency || 'ARS').toUpperCase();

  const hasFraction = (num % 1 !== 0) || showDecimals;
  const minimumFractionDigits = hasFraction ? 2 : 0;
  const maximumFractionDigits = 2;

  if (curr === 'USD') {
    // Formato Internacional USD $ 1,250.00 o USD 1,250
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(num);
    return `USD ${formatted}`;
  }

  // Formato Rioplatense ARS: $ 280.000 con punto como separador de miles
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num);
  return `$ ${formatted}`;
}
