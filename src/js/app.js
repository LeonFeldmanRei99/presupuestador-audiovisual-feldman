/**
 * app.js - Orquestador principal de la aplicación de presupuestos
 * Conecta el modelo de datos, almacenamiento, cálculos y renderizado de interfaz.
 */

import {
  DEFAULT_TEMPLATES,
  cloneBudget,
  createEmptyBudget
} from './model.js';

import {
  saveCurrentBudget,
  loadCurrentBudget,
  exportBudgetToJson,
  importBudgetFromJson,
  saveCustomTemplate,
  getSavedTemplates
} from './storage.js';

import {
  initUI,
  renderEditor,
  renderPreview,
  showToast,
  openAddSectionModal,
  closeAddSectionModal,
  confirmAddSection
} from './ui.js';

// Estado global de la aplicación
const AppState = {
  currentBudget: null,
  activeMobileTab: 'editor', // 'editor' | 'preview'
  savedTemplates: []
};

/**
 * Inicialización de la aplicación
 */
export function initApp() {
  // 1. Cargar plantillas personalizadas guardadas
  AppState.savedTemplates = getSavedTemplates();

  // 2. Cargar último presupuesto en edición o plantilla mensual predeterminada
  const savedBudget = loadCurrentBudget();
  if (savedBudget && savedBudget.client && Array.isArray(savedBudget.sections)) {
    AppState.currentBudget = savedBudget;
  } else {
    // Inicializar con la plantilla "Mensual con varias visitas"
    AppState.currentBudget = cloneBudget(DEFAULT_TEMPLATES['mensual']);
  }

  // 3. Inicializar manejadores del DOM y UI
  initUI({
    onUpdateBudget: handleBudgetUpdate,
    onDuplicateJornada: handleDuplicateJornada,
    onMoveSection: handleMoveSection,
    onDeleteSection: handleDeleteSection,
    onAddSectionRequest: handleAddSectionRequest
  });

  // 4. Configurar controles de cabecera y barra de herramientas
  setupHeaderControls();
  setupMobileViewTabs();
  setupModalControls();
  setupFileImport();

  // 5. Renderizar vista inicial
  updateViews();
}

/**
 * Actualiza las vistas de editor y previsualización editorial
 */
function updateViews() {
  renderEditor(AppState.currentBudget);
  renderPreview(AppState.currentBudget);
  // Auto-guardado transparente en localStorage
  saveCurrentBudget(AppState.currentBudget);
}

/**
 * Manejador cuando se modifica el modelo del presupuesto
 */
function handleBudgetUpdate(newBudgetData) {
  AppState.currentBudget = newBudgetData;
  updateViews();
}

/**
 * Duplicar una sección de jornada
 */
function handleDuplicateJornada(sectionId) {
  const sectionIdx = AppState.currentBudget.sections.findIndex(s => s.id === sectionId);
  if (sectionIdx === -1) return;

  const originalSection = AppState.currentBudget.sections[sectionIdx];
  const duplicatedSection = JSON.parse(JSON.stringify(originalSection));
  
  // Asignar nuevos identificadores
  duplicatedSection.id = 'sec_' + Math.random().toString(36).substring(2, 9);
  duplicatedSection.title = `${originalSection.title} (Copia)`;
  if (duplicatedSection.items && Array.isArray(duplicatedSection.items)) {
    duplicatedSection.items.forEach(item => {
      item.id = 'item_' + Math.random().toString(36).substring(2, 9);
    });
  }

  // Insertar inmediatamente a continuación
  AppState.currentBudget.sections.splice(sectionIdx + 1, 0, duplicatedSection);
  updateViews();
  showToast('Jornada duplicada exitosamente', 'success');
}

/**
 * Reordenar sección arriba / abajo
 */
function handleMoveSection(sectionId, direction) {
  const sections = AppState.currentBudget.sections;
  const idx = sections.findIndex(s => s.id === sectionId);
  if (idx === -1) return;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sections.length) return;

  const temp = sections[idx];
  sections[idx] = sections[targetIdx];
  sections[targetIdx] = temp;

  updateViews();
}

/**
 * Eliminar sección
 */
function handleDeleteSection(sectionId) {
  const sections = AppState.currentBudget.sections;
  const idx = sections.findIndex(s => s.id === sectionId);
  if (idx === -1) return;

  const sectionTitle = sections[idx].title || 'la sección';
  if (confirm(`¿Estás seguro de que deseás eliminar "${sectionTitle}"?`)) {
    sections.splice(idx, 1);
    updateViews();
    showToast('Sección eliminada', 'info');
  }
}

/**
 * Solicitud de abrir modal para añadir sección
 */
function handleAddSectionRequest() {
  openAddSectionModal();
}

/**
 * Configuración de botones de la cabecera
 */
function setupHeaderControls() {
  // Selector de plantillas predefinidas
  const templateSelect = document.getElementById('templateSelect');
  if (templateSelect) {
    populateTemplateDropdown(templateSelect);
    templateSelect.addEventListener('change', (e) => {
      const selectedKey = e.target.value;
      if (!selectedKey) return;

      if (confirm('¿Deseás cargar esta plantilla? Se reemplazarán los datos no guardados del presupuesto actual.')) {
        if (selectedKey === 'blanco') {
          AppState.currentBudget = createEmptyBudget();
        } else if (DEFAULT_TEMPLATES[selectedKey]) {
          AppState.currentBudget = cloneBudget(DEFAULT_TEMPLATES[selectedKey]);
        } else {
          // Plantilla guardada por el usuario
          const custom = AppState.savedTemplates.find(t => t.id === selectedKey);
          if (custom && custom.budget) {
            AppState.currentBudget = cloneBudget(custom.budget);
          }
        }
        updateViews();
        showToast('Plantilla aplicada correctamente', 'success');
      }
      templateSelect.value = ''; // Reset select indicator
    });
  }

  // Botón Nuevo Presupuesto
  const btnNewBudget = document.getElementById('btnNewBudget');
  if (btnNewBudget) {
    btnNewBudget.addEventListener('click', () => {
      if (confirm('¿Comenzar un presupuesto nuevo en blanco?')) {
        AppState.currentBudget = createEmptyBudget();
        updateViews();
        showToast('Nuevo presupuesto en blanco creado', 'info');
      }
    });
  }

  // Botón Guardar como plantilla personalizada
  const btnSaveTemplate = document.getElementById('btnSaveTemplate');
  if (btnSaveTemplate) {
    btnSaveTemplate.addEventListener('click', () => {
      const templateName = prompt('Ingresá un nombre para guardar esta plantilla personalizada:', AppState.currentBudget.title || 'Mi Plantilla');
      if (templateName && templateName.trim()) {
        const saved = saveCustomTemplate(templateName.trim(), AppState.currentBudget);
        if (saved) {
          AppState.savedTemplates = getSavedTemplates();
          if (templateSelect) populateTemplateDropdown(templateSelect);
          showToast(`Plantilla "${templateName.trim()}" guardada`, 'success');
        } else {
          showToast('No se pudo guardar la plantilla', 'error');
        }
      }
    });
  }

  // Botón Exportar JSON (backup)
  const btnExportJson = document.getElementById('btnExportJson');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const fileName = `presupuesto-${(AppState.currentBudget.number || 'cotizacion').toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.json`;
      exportBudgetToJson(AppState.currentBudget, fileName);
      showToast('Archivo JSON descargado', 'success');
    });
  }

  // Botón Importar JSON
  const btnImportJson = document.getElementById('btnImportJson');
  const jsonFileInput = document.getElementById('jsonFileInput');
  if (btnImportJson && jsonFileInput) {
    btnImportJson.addEventListener('click', () => {
      jsonFileInput.click();
    });
  }

  // Botón Imprimir / Exportar a PDF
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * Rellena las opciones del menú desplegable de plantillas
 */
function populateTemplateDropdown(selectElement) {
  selectElement.innerHTML = `
    <option value="" disabled selected>📂 Cargar plantilla...</option>
    <optgroup label="Plantillas de la industria">
      <option value="mensual">📅 Mensual con visitas periódicas (Redes/Marcas)</option>
      <option value="jornada">🎬 Jornada de rodaje / sesión (Foto y Video)</option>
      <option value="pieza">📦 Entregable por pieza cerrada (Comercial)</option>
      <option value="blanco">📄 Presupuesto en blanco</option>
    </optgroup>
  `;

  if (AppState.savedTemplates.length > 0) {
    const customGroup = document.createElement('optgroup');
    customGroup.label = 'Tus plantillas guardadas';
    AppState.savedTemplates.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `⭐ ${t.name}`;
      customGroup.appendChild(opt);
    });
    selectElement.appendChild(customGroup);
  }
}

/**
 * Pestañas de alternancia en dispositivos móviles
 */
function setupMobileViewTabs() {
  const btnTabEditor = document.getElementById('tabEditor');
  const btnTabPreview = document.getElementById('tabPreview');
  const editorCol = document.getElementById('editorColumn');
  const previewCol = document.getElementById('previewColumn');

  if (!btnTabEditor || !btnTabPreview) return;

  btnTabEditor.addEventListener('click', () => {
    AppState.activeMobileTab = 'editor';
    btnTabEditor.classList.add('active');
    btnTabPreview.classList.remove('active');
    if (editorCol) editorCol.classList.remove('mobile-hidden');
    if (previewCol) previewCol.classList.add('mobile-hidden');
  });

  btnTabPreview.addEventListener('click', () => {
    AppState.activeMobileTab = 'preview';
    btnTabPreview.classList.add('active');
    btnTabEditor.classList.remove('active');
    if (previewCol) previewCol.classList.remove('mobile-hidden');
    if (editorCol) editorCol.classList.add('mobile-hidden');
  });
}

/**
 * Configuración del modal para añadir nuevas secciones
 */
function setupModalControls() {
  const btnCancelAddSection = document.getElementById('btnCancelAddSection');
  const btnConfirmAddSection = document.getElementById('btnConfirmAddSection');

  if (btnCancelAddSection) {
    btnCancelAddSection.addEventListener('click', () => {
      closeAddSectionModal();
    });
  }

  if (btnConfirmAddSection) {
    btnConfirmAddSection.addEventListener('click', () => {
      const newSection = confirmAddSection();
      if (newSection) {
        AppState.currentBudget.sections.push(newSection);
        updateViews();
        closeAddSectionModal();
        showToast(`Sección "${newSection.title}" agregada`, 'success');
      }
    });
  }

  // Cerrar al hacer clic en el backdrop
  const modalOverlay = document.getElementById('addSectionModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAddSectionModal();
      }
    });
  }
}

/**
 * Configuración para importar archivo JSON
 */
function setupFileImport() {
  const jsonFileInput = document.getElementById('jsonFileInput');
  if (!jsonFileInput) return;

  jsonFileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const importedBudget = await importBudgetFromJson(file);
      AppState.currentBudget = importedBudget;
      updateViews();
      showToast('Presupuesto importado exitosamente', 'success');
    } catch (err) {
      alert(`Error al importar presupuesto: ${err.message}`);
    } finally {
      jsonFileInput.value = '';
    }
  });
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', initApp);
