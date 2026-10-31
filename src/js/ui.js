/**
 * Módulo de Interfaz de Usuario (UI)
 * Renderizado reactivo del panel de edición, sincronización con vista previa A4 y eventos.
 */

import {
  calculateLineSubtotal,
  calculateSectionSubtotal,
  calculateBudgetTotals,
  formatCurrency,
  parseAmount
} from './calc.js';
import { generateId } from './model.js';

let currentBudgetRef = null;
let onBudgetChangeCallback = null;

/**
 * Inicializa el módulo de UI vinculando el presupuesto activo y el callback de cambios.
 * @param {Object} budget
 * @param {Function} onChange
 */
export function initUI(budget, onChange) {
  currentBudgetRef = budget;
  onBudgetChangeCallback = onChange;
  renderEditor();
  renderPreview();
}

/**
 * Actualiza la referencia del presupuesto activo y re-renderiza.
 * @param {Object} newBudget
 */
export function updateActiveBudget(newBudget) {
  currentBudgetRef = newBudget;
  renderEditor();
  renderPreview();
}

/**
 * Notifica a la aplicación de un cambio en los datos y re-renderiza la vista previa.
 */
function triggerChange() {
  if (onBudgetChangeCallback) {
    onBudgetChangeCallback(currentBudgetRef);
  }
  renderPreview();
}

/**
 * Muestra una notificación visual no invasiva tipo toast.
 * @param {string} message
 */
export function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* ═══════════════════════════════════════════════════════════════
   1. RENDERIZADO DEL PANEL EDITOR (FORMULARIOS & SECCIONES)
   ═══════════════════════════════════════════════════════════════ */
export function renderEditor() {
  const container = document.getElementById('editorContainer');
  if (!container || !currentBudgetRef) return;

  const b = currentBudgetRef;
  const m = b.metadata || {};

  container.innerHTML = `
    <!-- Tarjeta: Metadatos del Cliente y Proyecto -->
    <div class="editor-card">
      <div class="editor-card-header">
        <span class="card-title">📋 Datos del Cliente y Proyecto</span>
      </div>
      <div class="form-grid">
        <div class="form-group form-group-full">
          <label class="form-label">Título del Documento</label>
          <input type="text" class="form-input" data-field="title" value="${escapeHtml(m.title || '')}">
        </div>
        <div class="form-group form-group-full">
          <label class="form-label">Nombre del Proyecto</label>
          <input type="text" class="form-input" data-field="projectName" value="${escapeHtml(m.projectName || '')}">
        </div>
        <div class="form-group form-group-full">
          <label class="form-label">Subtítulo / Bajada Técnica</label>
          <input type="text" class="form-input" data-field="subtitle" value="${escapeHtml(m.subtitle || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Cliente / Empresa</label>
          <input type="text" class="form-input" data-field="client" value="${escapeHtml(m.client || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Atención / Contacto</label>
          <input type="text" class="form-input" data-field="attention" value="${escapeHtml(m.attention || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Emisión</label>
          <input type="text" class="form-input" data-field="date" value="${escapeHtml(m.date || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Validez de la Propuesta</label>
          <input type="text" class="form-input" data-field="validity" value="${escapeHtml(m.validity || '')}">
        </div>
        <div class="form-group form-group-full">
          <label class="form-label">Locaciones Programadas</label>
          <input type="text" class="form-input" data-field="locations" value="${escapeHtml(m.locations || '')}">
        </div>
        <div class="form-group form-group-full">
          <label class="form-label">Síntesis / Objetivo del Proyecto</label>
          <textarea class="form-textarea" data-field="summary">${escapeHtml(m.summary || '')}</textarea>
        </div>
      </div>
    </div>

    <!-- Tarjeta: Configuración Financiera y Moneda -->
    <div class="editor-card">
      <div class="editor-card-header">
        <span class="card-title">💰 Condiciones Financieras &amp; Moneda</span>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Moneda</label>
          <select class="select-ui" id="currencySelector" data-field="currency">
            <option value="ARS" ${m.currency === 'ARS' ? 'selected' : ''}>ARS ($ Pesos Argentinos)</option>
            <option value="USD" ${m.currency === 'USD' ? 'selected' : ''}>USD ($ Dólares Estadounidenses)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Anticipo Requerido (%)</label>
          <input type="number" class="form-input" data-field="anticipoPercent" min="0" max="100" value="${m.anticipoPercent !== undefined ? m.anticipoPercent : 50}">
        </div>
        <div class="form-group">
          <label class="form-label">Descuento (%)</label>
          <input type="number" class="form-input" data-field="discountPercent" min="0" max="100" value="${m.discountPercent || 0}">
        </div>
        <div class="form-group">
          <label class="form-label">Impuestos / IVA (%)</label>
          <input type="number" class="form-input" data-field="taxPercent" min="0" max="100" value="${m.taxPercent || 0}">
        </div>
      </div>
    </div>

    <!-- Lista de Secciones Configurables & Reordenables -->
    <div class="editor-card">
      <div class="editor-card-header">
        <span class="card-title">📑 Secciones del Presupuesto</span>
        <button class="btn btn-gold btn-icon" id="btnAddSectionModal" title="Agregar nueva sección">+ Agregar Sección</button>
      </div>
      <div class="sections-list" id="sectionsEditorList">
        <!-- Render dinámico de secciones -->
      </div>
    </div>
  `;

  bindMetadataInputs();
  renderSectionsEditor();
}

/**
 * Vincula los inputs de metadatos con el modelo activo.
 */
function bindMetadataInputs() {
  const container = document.getElementById('editorContainer');
  if (!container) return;

  const inputs = container.querySelectorAll('[data-field]');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const field = e.target.getAttribute('data-field');
      let val = e.target.value;
      if (field === 'discountPercent' || field === 'taxPercent' || field === 'anticipoPercent') {
        val = parseFloat(val) || 0;
      }
      currentBudgetRef.metadata[field] = val;
      triggerChange();
    });
  });
}

/**
 * Renderiza el listado de secciones editables en el panel izquierdo.
 */
function renderSectionsEditor() {
  const listEl = document.getElementById('sectionsEditorList');
  if (!listEl || !currentBudgetRef) return;

  listEl.innerHTML = '';

  currentBudgetRef.sections.forEach((sec, secIdx) => {
    const secBox = document.createElement('div');
    secBox.className = 'section-item-box';
    secBox.dataset.secId = sec.id;

    secBox.innerHTML = `
      <div class="section-box-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="color:var(--ui-accent); font-weight:700; font-size:11px;">${escapeHtml(sec.numeral || '')}</span>
          <span class="section-box-title">${escapeHtml(sec.title || 'Sección')}</span>
          <span style="font-size:9.5px; color:#888; text-transform:uppercase;">(${sec.type})</span>
        </div>
        <div class="section-box-tools">
          <button class="tool-mini-btn" data-action="move-up" data-idx="${secIdx}" title="Subir sección">▲</button>
          <button class="tool-mini-btn" data-action="move-down" data-idx="${secIdx}" title="Bajar sección">▼</button>
          <button class="tool-mini-btn" data-action="duplicate" data-idx="${secIdx}" title="Duplicar sección">⧉</button>
          <button class="tool-mini-btn danger" data-action="delete" data-idx="${secIdx}" title="Eliminar sección">✕</button>
        </div>
      </div>

      <!-- Cabecera de la sección editable -->
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Título de Sección</label>
          <input type="text" class="form-input sec-title-input" value="${escapeHtml(sec.title || '')}" data-sec-idx="${secIdx}" data-sec-field="title">
        </div>
        <div class="form-group">
          <label class="form-label">Subtítulo / Etiqueta</label>
          <input type="text" class="form-input sec-subtitle-input" value="${escapeHtml(sec.subtitle || '')}" data-sec-idx="${secIdx}" data-sec-field="subtitle">
        </div>
      </div>

      <!-- Contenedor de Ítems según tipo de sección -->
      <div class="items-editor-container" id="itemsContainer_${sec.id}">
        ${renderSectionItemsEditor(sec, secIdx)}
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:4px;">
        <button class="btn btn-icon" style="font-size:11px; padding:4px 8px;" data-action="add-item" data-sec-idx="${secIdx}">
          + Agregar Ítem
        </button>
      </div>
    `;

    listEl.appendChild(secBox);
  });

  bindSectionTools();
}

/**
 * Renderiza los ítems internos de una sección en el editor según su tipo.
 */
function renderSectionItemsEditor(sec, secIdx) {
  const items = sec.items || [];

  if (sec.type === 'financial') {
    return items.map((item, itemIdx) => {
      const lineSubtotal = calculateLineSubtotal(item.quantity, item.unitPrice);
      return `
        <div class="item-editor-row" data-item-idx="${itemIdx}">
          <div class="item-editor-grid">
            <input type="text" class="form-input" placeholder="Concepto / Tarea" value="${escapeHtml(item.desc || '')}" data-item-field="desc">
            <input type="number" class="form-input" placeholder="Cant." min="0" step="any" value="${item.quantity !== undefined ? item.quantity : 1}" data-item-field="quantity">
            <input type="text" class="form-input" placeholder="Unidad" value="${escapeHtml(item.unit || 'gl')}" data-item-field="unit">
            <input type="number" class="form-input" placeholder="Precio Unit." min="0" step="1000" value="${item.unitPrice || 0}" data-item-field="unitPrice">
            <button class="tool-mini-btn danger" data-action="delete-item" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}">✕</button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <input type="text" class="form-input" style="font-size:11.5px; opacity:0.85;" placeholder="+ Subtexto explicativo (horas, equipo, etc.)" value="${escapeHtml(item.subtext || '')}" data-item-field="subtext">
            <span style="font-size:11px; color:var(--ui-accent); margin-left:8px; white-space:nowrap; font-weight:600;">
              Subtotal: ${formatCurrency(lineSubtotal, currentBudgetRef?.metadata?.currency)}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  if (sec.type === 'jornadas') {
    return items.map((item, itemIdx) => `
      <div class="item-editor-row" data-item-idx="${itemIdx}">
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="text" class="form-input" style="font-weight:600;" placeholder="Título de la jornada" value="${escapeHtml(item.title || '')}" data-item-field="title">
          <input type="text" class="form-input" style="max-width:140px;" placeholder="Duración / Badge" value="${escapeHtml(item.durationBadge || '')}" data-item-field="durationBadge">
          <button class="tool-mini-btn danger" data-action="delete-item" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}">✕</button>
        </div>
        <textarea class="form-textarea" placeholder="Detalle de cobertura y equipamiento" data-item-field="detail">${escapeHtml(item.detail || '')}</textarea>
        <input type="text" class="form-input" style="font-size:11.5px; font-style:italic;" placeholder="Entregables generados por esta jornada" value="${escapeHtml(item.deliverablesNote || '')}" data-item-field="deliverablesNote">
      </div>
    `).join('');
  }

  if (sec.type === 'deliverables') {
    return items.map((item, itemIdx) => `
      <div class="item-editor-row" data-item-idx="${itemIdx}">
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="text" class="form-input" style="font-weight:600;" placeholder="Entregable (ej. 03 Reels en vertical)" value="${escapeHtml(item.title || '')}" data-item-field="title">
          <button class="tool-mini-btn danger" data-action="delete-item" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}">✕</button>
        </div>
        <textarea class="form-textarea" placeholder="Descripción de especificaciones, resolución y duración" data-item-field="description">${escapeHtml(item.description || '')}</textarea>
      </div>
    `).join('');
  }

  if (sec.type === 'conditions') {
    return items.map((item, itemIdx) => `
      <div class="item-editor-row" data-item-idx="${itemIdx}">
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="text" class="form-input" style="font-weight:600;" placeholder="Título de la cláusula (ej. FORMA DE PAGO)" value="${escapeHtml(item.heading || '')}" data-item-field="heading">
          <button class="tool-mini-btn danger" data-action="delete-item" data-sec-idx="${secIdx}" data-item-idx="${itemIdx}">✕</button>
        </div>
        <textarea class="form-textarea" placeholder="Términos y condiciones detalladas" data-item-field="body">${escapeHtml(item.body || '')}</textarea>
      </div>
    `).join('');
  }

  return '';
}

/**
 * Asocia eventos de manipulación de secciones e ítems en el Editor.
 */
function bindSectionTools() {
  const listEl = document.getElementById('sectionsEditorList');
  if (!listEl) return;

  // Modificación de títulos de sección
  listEl.querySelectorAll('[data-sec-field]').forEach(input => {
    input.addEventListener('input', (e) => {
      const secIdx = parseInt(e.target.dataset.secIdx, 10);
      const field = e.target.dataset.secField;
      if (currentBudgetRef.sections[secIdx]) {
        currentBudgetRef.sections[secIdx][field] = e.target.value;
        triggerChange();
      }
    });
  });

  // Modificación de campos de ítems
  listEl.querySelectorAll('.item-editor-row').forEach(row => {
    const secBox = row.closest('.section-item-box');
    const secId = secBox?.dataset?.secId;
    const secIdx = currentBudgetRef.sections.findIndex(s => s.id === secId);
    const itemIdx = parseInt(row.dataset.itemIdx, 10);

    row.querySelectorAll('[data-item-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.dataset.itemField;
        let val = e.target.value;
        if (field === 'quantity' || field === 'unitPrice') {
          val = parseFloat(val) || 0;
        }
        if (currentBudgetRef.sections[secIdx]?.items[itemIdx]) {
          currentBudgetRef.sections[secIdx].items[itemIdx][field] = val;
          triggerChange();
        }
      });
    });
  });

  // Botones de acción (subir, bajar, duplicar, eliminar, agregar ítem)
  listEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      const secIdx = parseInt(btn.dataset.secIdx !== undefined ? btn.dataset.secIdx : btn.dataset.idx, 10);

      if (action === 'move-up' && secIdx > 0) {
        const temp = currentBudgetRef.sections[secIdx];
        currentBudgetRef.sections[secIdx] = currentBudgetRef.sections[secIdx - 1];
        currentBudgetRef.sections[secIdx - 1] = temp;
        recalculateNumerals();
        renderEditor();
        triggerChange();
      } else if (action === 'move-down' && secIdx < currentBudgetRef.sections.length - 1) {
        const temp = currentBudgetRef.sections[secIdx];
        currentBudgetRef.sections[secIdx] = currentBudgetRef.sections[secIdx + 1];
        currentBudgetRef.sections[secIdx + 1] = temp;
        recalculateNumerals();
        renderEditor();
        triggerChange();
      } else if (action === 'duplicate') {
        const clonedSec = JSON.parse(JSON.stringify(currentBudgetRef.sections[secIdx]));
        clonedSec.id = generateId('sec');
        clonedSec.title += ' (Copia)';
        if (Array.isArray(clonedSec.items)) {
          clonedSec.items.forEach(it => { it.id = generateId('item'); });
        }
        currentBudgetRef.sections.splice(secIdx + 1, 0, clonedSec);
        recalculateNumerals();
        renderEditor();
        triggerChange();
        showToast('Sección duplicada');
      } else if (action === 'delete') {
        if (confirm('¿Eliminar esta sección del presupuesto?')) {
          currentBudgetRef.sections.splice(secIdx, 1);
          recalculateNumerals();
          renderEditor();
          triggerChange();
          showToast('Sección eliminada');
        }
      } else if (action === 'add-item') {
        addItemToSection(secIdx);
      } else if (action === 'delete-item') {
        const itemIdx = parseInt(btn.dataset.itemIdx, 10);
        currentBudgetRef.sections[secIdx].items.splice(itemIdx, 1);
        renderEditor();
        triggerChange();
      }
    });
  });

  // Modal para agregar nueva sección
  const btnAddSection = document.getElementById('btnAddSectionModal');
  if (btnAddSection) {
    btnAddSection.onclick = () => openAddSectionModal();
  }
}

/**
 * Agrega un nuevo ítem por defecto a una sección.
 */
function addItemToSection(secIdx) {
  const sec = currentBudgetRef.sections[secIdx];
  if (!sec) return;
  sec.items = sec.items || [];

  if (sec.type === 'financial') {
    sec.items.push({
      id: generateId('fin'),
      desc: 'Nuevo concepto de producción',
      subtext: '+ detalle explicativo de horas o equipo',
      quantity: 1,
      unit: 'global',
      unitPrice: 0
    });
  } else if (sec.type === 'jornadas') {
    const num = sec.items.length + 1;
    sec.items.push({
      id: generateId('jor'),
      title: `JORNADA 0${num} · [LOCACIÓN / COBERTURA]`,
      durationBadge: '4 HORAS EN LOCACIÓN',
      detail: 'Registro y cobertura técnica en locación con equipamiento cinematográfico y sonido.',
      deliverablesNote: 'Genera: Piezas audiovisuales y fotos editadas.'
    });
  } else if (sec.type === 'deliverables') {
    sec.items.push({
      id: generateId('deliv'),
      title: 'Nuevo Entregable Final',
      description: 'Especificación de formato, duración, aspect ratio y destino de publicación.'
    });
  } else if (sec.type === 'conditions') {
    sec.items.push({
      id: generateId('cond'),
      heading: 'NUEVA CONDICIÓN',
      body: 'Términos y condiciones comerciales acordadas con el cliente.'
    });
  }

  renderEditor();
  triggerChange();
}

/**
 * Re-asigna numerales romanos ("I", "II", "III", etc.) tras reordenar.
 */
function recalculateNumerals() {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  currentBudgetRef.sections.forEach((sec, idx) => {
    sec.numeral = romanNumerals[idx] || String(idx + 1);
  });
}

/**
 * Abre el modal para seleccionar el tipo de sección a añadir.
 */
function openAddSectionModal() {
  const modal = document.getElementById('addSectionModal');
  if (modal) modal.classList.add('active');
}

export function closeAddSectionModal() {
  const modal = document.getElementById('addSectionModal');
  if (modal) modal.classList.remove('active');
}

export function createSectionOfType(type) {
  const numeralIdx = currentBudgetRef.sections.length;
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const numeral = romanNumerals[numeralIdx] || String(numeralIdx + 1);

  let newSec = {
    id: generateId('sec'),
    type: type,
    numeral: numeral,
    title: 'NUEVA SECCIÓN',
    subtitle: 'DETALLE',
    items: []
  };

  if (type === 'financial') {
    newSec.title = 'RUBRO DE HONORARIOS / GASTOS';
    newSec.subtitle = 'COSTOS DIRECTOS Y PROFESIONALES';
    newSec.items.push({
      id: generateId('fin'),
      desc: 'Concepto de servicio',
      subtext: 'Detalle de tareas',
      quantity: 1,
      unit: 'global',
      unitPrice: 0
    });
  } else if (type === 'jornadas') {
    newSec.title = 'ALCANCE DE JORNADAS';
    newSec.subtitle = 'PLAN DE RODAJE';
    newSec.items.push({
      id: generateId('jor'),
      title: 'JORNADA · LOCACIÓN',
      durationBadge: '4 HORAS',
      detail: 'Plan de tomas y cobertura.',
      deliverablesNote: 'Genera: Material bruto para edición.'
    });
  } else if (type === 'deliverables') {
    newSec.title = 'LISTADO DE ENTREGABLES';
    newSec.subtitle = 'ALCANCE CONCRETO';
    newSec.items.push({
      id: generateId('deliv'),
      title: 'Pieza de Video / Fotografía',
      description: 'Resolución y especificaciones técnicas.'
    });
  } else if (type === 'conditions') {
    newSec.title = 'CONDICIONES DEL SERVICIO';
    newSec.subtitle = 'TÉRMINOS CONTRACTUALES';
    newSec.items.push({
      id: generateId('cond'),
      heading: 'TÉRMINO COMERCIAL',
      body: 'Detalle de la condición pactada.'
    });
  }

  currentBudgetRef.sections.push(newSec);
  closeAddSectionModal();
  renderEditor();
  triggerChange();
  showToast('Sección agregada');
}

/* ═══════════════════════════════════════════════════════════════
   2. RENDERIZADO DE LA VISTA PREVIA EDITORIAL A4
   ═══════════════════════════════════════════════════════════════ */
export function renderPreview() {
  const container = document.getElementById('previewSheetWrapper');
  if (!container || !currentBudgetRef) return;

  const b = currentBudgetRef;
  const m = b.metadata || {};
  const curr = m.currency || 'ARS';

  // Calcular subtotal general sumando todas las secciones financieras
  let grossSubtotal = 0;
  b.sections.forEach(sec => {
    if (sec.type === 'financial') {
      grossSubtotal += calculateSectionSubtotal(sec.items);
    }
  });

  // Calcular totales consolidados con calc.js
  const totals = calculateBudgetTotals({
    subtotal: grossSubtotal,
    discountPercent: m.discountPercent,
    taxPercent: m.taxPercent,
    anticipoPercent: m.anticipoPercent
  });

  // Renderizar contenido dinámico de las secciones
  const sectionsHtml = b.sections.map(sec => {
    if (sec.type === 'jornadas') {
      const itemsHtml = (sec.items || []).map(it => `
        <div class="jornada-card">
          <div class="jornada-header">
            <span class="jornada-title">${escapeHtml(it.title || '')}</span>
            <span class="jornada-badge">${escapeHtml(it.durationBadge || '')}</span>
          </div>
          <div class="jornada-detail">${escapeHtml(it.detail || '')}</div>
          ${it.deliverablesNote ? `<div class="jornada-deliverable-sub">${escapeHtml(it.deliverablesNote)}</div>` : ''}
        </div>
      `).join('');

      return `
        <div class="section-title-wrap">
          <div class="section-numeral-title">
            <span class="sec-num">${escapeHtml(sec.numeral || '')}</span>
            <span class="sec-title">${escapeHtml(sec.title || '')}</span>
          </div>
          <span class="meta-label">${escapeHtml(sec.subtitle || '')}</span>
        </div>
        <div class="jornadas-grid">${itemsHtml}</div>
        <hr class="rule-line">
      `;
    }

    if (sec.type === 'deliverables') {
      const itemsHtml = (sec.items || []).map(it => `
        <div class="deliverable-line">
          <span class="deliv-dot">✦</span>
          <span class="deliv-text">
            <strong>${escapeHtml(it.title || '')}:</strong> ${escapeHtml(it.description || '')}
          </span>
        </div>
      `).join('');

      return `
        <div class="section-title-wrap">
          <div class="section-numeral-title">
            <span class="sec-num">${escapeHtml(sec.numeral || '')}</span>
            <span class="sec-title">${escapeHtml(sec.title || '')}</span>
          </div>
          <span class="meta-label">${escapeHtml(sec.subtitle || '')}</span>
        </div>
        <div class="deliverables-box">
          <div class="deliverables-list">${itemsHtml}</div>
          ${sec.scopeWarning ? `<div class="scope-warning">${escapeHtml(sec.scopeWarning)}</div>` : ''}
        </div>
        <hr class="rule-line">
      `;
    }

    if (sec.type === 'financial') {
      const secSubtotal = calculateSectionSubtotal(sec.items);
      const itemsHtml = (sec.items || []).map(it => {
        const lineSubtotal = calculateLineSubtotal(it.quantity, it.unitPrice);
        const qtyLabel = (it.quantity && it.unit) ? `${it.quantity} ${it.unit}` : '';
        return `
          <div class="fin-item-row">
            <div class="fin-main-line">
              <span class="fin-desc">${escapeHtml(it.desc || '')}</span>
              ${qtyLabel ? `<span class="fin-qty-badge">(${escapeHtml(qtyLabel)})</span>` : ''}
              <span class="fin-dots"></span>
              <span class="fin-amount">${formatCurrency(lineSubtotal, curr)}</span>
            </div>
            ${it.subtext ? `<div class="fin-subtext">${escapeHtml(it.subtext)}</div>` : ''}
          </div>
        `;
      }).join('');

      return `
        <div class="section-title-wrap">
          <div class="section-numeral-title">
            <span class="sec-num">${escapeHtml(sec.numeral || '')}</span>
            <span class="sec-title">${escapeHtml(sec.title || '')}</span>
          </div>
          <span class="meta-label">${escapeHtml(sec.subtitle || '')}</span>
        </div>
        <div class="financial-table">${itemsHtml}</div>
        <div class="subtotal-row">
          <span class="subtotal-label">SUBTOTAL ${escapeHtml(sec.title || '')}</span>
          <span class="subtotal-value">${formatCurrency(secSubtotal, curr)}</span>
        </div>
        <hr class="rule-line">
      `;
    }

    if (sec.type === 'conditions') {
      const itemsHtml = (sec.items || []).map(it => `
        <div class="condition-block">
          <div class="condition-heading">${escapeHtml(it.heading || '')}</div>
          <div class="condition-body">${escapeHtml(it.body || '')}</div>
        </div>
      `).join('');

      return `
        <div class="section-title-wrap">
          <div class="section-numeral-title">
            <span class="sec-num">${escapeHtml(sec.numeral || '')}</span>
            <span class="sec-title">${escapeHtml(sec.title || '')}</span>
          </div>
          <span class="meta-label">${escapeHtml(sec.subtitle || '')}</span>
        </div>
        <div class="conditions-grid">${itemsHtml}</div>
      `;
    }

    return '';
  }).join('');

  // Estructura de la Hoja A4 con marco fino de 0.65px (0.5pt)
  container.innerHTML = `
    <article class="a4-sheet" id="printSheet">
      <div class="editorial-frame">

        <!-- Encabezado Editorial -->
        <header class="header-top">
          <div class="brand-block">
            <div class="brand-name">${escapeHtml(m.authorName || 'LEÓN FELDMAN REINOSO')}</div>
            <div class="brand-subtitle">${escapeHtml(m.authorRole || 'FOTOGRAFÍA Y VIDEO')}</div>
            <a class="brand-link" href="${escapeHtml(m.portfolioUrl || 'https://behance.net/leonfeldman')}" target="_blank">PORTFOLIO ONLINE ↗</a>
          </div>
          <div class="header-meta-right">
            <div class="header-date">${escapeHtml(m.date || '')}</div>
            <div class="header-page-tag">PROPUESTA DE PRODUCCIÓN · PÁG. 01</div>
          </div>
        </header>

        <!-- Título Principal -->
        <div class="title-block">
          <h1 class="doc-title">${escapeHtml(m.title || 'Propuesta de Producción')}</h1>
          <div class="project-name">${escapeHtml(m.projectName || '')}</div>
          <div class="project-meta">${escapeHtml(m.subtitle || '')}</div>
        </div>

        <hr class="rule-line">

        <!-- Metadatos de la Cotización -->
        <div class="meta-box-grid">
          <div class="meta-item">
            <span class="meta-label">CLIENTE</span>
            <span class="meta-value">${escapeHtml(m.client || '')}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">ATENCIÓN</span>
            <span class="meta-value">${escapeHtml(m.attention || '')}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">VALIDEZ</span>
            <span class="meta-value">${escapeHtml(m.validity || '')}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">LOCACIONES</span>
            <span class="meta-value">${escapeHtml(m.locations || '')}</span>
          </div>
        </div>

        <!-- Síntesis del Proyecto -->
        ${m.summary ? `
          <div class="summary-block">
            <div class="summary-heading">OBJETIVO &amp; SÍNTESIS NARRATIVA DEL PROYECTO</div>
            <div class="summary-text">${escapeHtml(m.summary)}</div>
          </div>
        ` : ''}

        <hr class="rule-line">

        <!-- Secciones Dinámicas -->
        ${sectionsHtml}

        <!-- Bloque de Totales Consolidados -->
        <div class="grand-total-section">
          ${totals.discountPercent > 0 ? `
            <div class="grand-total-breakdown-row">
              <span>SUBTOTAL BRUTO: ${formatCurrency(totals.subtotal, curr)}</span>
              <span>BONIFICACIÓN / DESCUENTO (${totals.discountPercent}%): -${formatCurrency(totals.discountAmount, curr)}</span>
            </div>
          ` : ''}

          ${totals.taxPercent > 0 ? `
            <div class="grand-total-breakdown-row">
              <span>BASE IMPONIBLE: ${formatCurrency(totals.subtotalWithDiscount, curr)}</span>
              <span>IVA / IMPUESTOS (${totals.taxPercent}%): +${formatCurrency(totals.taxAmount, curr)}</span>
            </div>
          ` : ''}

          <div class="grand-total-main-row">
            <span class="grand-total-label">TOTAL GENERAL DEL PROYECTO</span>
            <span class="grand-total-figure">${formatCurrency(totals.grandTotal, curr)}</span>
          </div>

          <div class="advance-balance-row">
            <div class="advance-box">
              <span class="advance-label">ANTICIPO ${totals.anticipoPercent}% (RESERVA DE AGENDA)</span>
              <span class="advance-val">${formatCurrency(totals.anticipoAmount, curr)}</span>
            </div>
            <div class="balance-box" style="text-align:right;">
              <span class="advance-label">SALDO CONTRA ENTREGA FINAL</span>
              <span class="advance-val">${formatCurrency(totals.saldoAmount, curr)}</span>
            </div>
          </div>
        </div>

        <!-- Firmas de Conformidad -->
        <div class="signature-grid">
          <div class="sig-col">
            <div class="sig-line"></div>
            <div class="sig-name">${escapeHtml(m.authorName || 'LEÓN FELDMAN REINOSO')}</div>
            <div class="sig-role">${escapeHtml(m.authorRole || 'Dirección de Fotografía & Realización Audiovisual')}</div>
          </div>
          <div class="sig-col">
            <div class="sig-line"></div>
            <div class="sig-name">${escapeHtml(m.client || '[NOMBRE DEL CLIENTE / FIRMA]')}</div>
            <div class="sig-role">Aceptación y Conformidad de la Propuesta</div>
          </div>
        </div>

        <!-- Pie de Página Editorial -->
        <footer class="page-footer-editorial">
          <span class="page-footer-tag">${escapeHtml(m.authorName || 'LEÓN FELDMAN')} · PRODUCCIÓN AUDIOVISUAL &amp; FOTOGRAFÍA</span>
          <span class="page-footer-pager">PROPUESTA DE PRODUCCIÓN · CIERRE</span>
        </footer>

      </div>
    </article>
  `;
}

/**
 * Escapa strings para evitar inyecciones HTML.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
