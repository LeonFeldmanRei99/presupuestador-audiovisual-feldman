/**
 * Módulo de Almacenamiento Local Seguro e Importación / Exportación
 * Manejo estricto de excepciones (try/catch), cuota de almacenamiento y fallback en memoria.
 */

const STORAGE_KEY_BUDGETS = 'leon_audiovisual_budgets_v1';
const STORAGE_KEY_CUSTOM_TEMPLATES = 'leon_audiovisual_custom_templates_v1';
const STORAGE_KEY_CURRENT_ID = 'leon_audiovisual_current_budget_id_v1';

// Fallback en memoria si localStorage está deshabilitado o arroja SecurityError
const memoryStore = new Map();

/**
 * Comprueba si localStorage está disponible y operativo.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Obtiene un ítem del almacenamiento seguro.
 * @param {string} key
 * @returns {any|null}
 */
function safeGetItem(key) {
  try {
    if (isStorageAvailable()) {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }
    return memoryStore.get(key) || null;
  } catch (e) {
    console.warn(`[Storage] Error al leer la clave "${key}":`, e);
    return memoryStore.get(key) || null;
  }
}

/**
 * Guarda un ítem en el almacenamiento seguro.
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
function safeSetItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (isStorageAvailable()) {
      window.localStorage.setItem(key, serialized);
    }
    memoryStore.set(key, value);
    return true;
  } catch (e) {
    console.warn(`[Storage] Error al escribir en almacenamiento "${key}":`, e);
    memoryStore.set(key, value);
    return false;
  }
}

/**
 * Obtiene la lista de presupuestos guardados por el usuario.
 * @returns {Array<Object>}
 */
export function getSavedBudgets() {
  const data = safeGetItem(STORAGE_KEY_BUDGETS);
  return Array.isArray(data) ? data : [];
}

/**
 * Guarda o actualiza un presupuesto en la lista de presupuestos guardados.
 * @param {Object} budget
 * @returns {boolean}
 */
export function saveBudget(budget) {
  if (!budget || !budget.id) return false;
  budget.updatedAt = new Date().toISOString();

  const budgets = getSavedBudgets();
  const existingIdx = budgets.findIndex(b => b.id === budget.id);

  if (existingIdx >= 0) {
    budgets[existingIdx] = budget;
  } else {
    budgets.unshift(budget);
  }

  const success = safeSetItem(STORAGE_KEY_BUDGETS, budgets);
  safeSetItem(STORAGE_KEY_CURRENT_ID, budget.id);
  return success;
}

/**
 * Obtiene un presupuesto por su ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getBudgetById(id) {
  const budgets = getSavedBudgets();
  return budgets.find(b => b.id === id) || null;
}

/**
 * Elimina un presupuesto por su ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteBudget(id) {
  const budgets = getSavedBudgets().filter(b => b.id !== id);
  return safeSetItem(STORAGE_KEY_BUDGETS, budgets);
}

/**
 * Guarda el ID del presupuesto activo para restaurarlo al recargar.
 * @param {string} id
 */
export function setCurrentBudgetId(id) {
  safeSetItem(STORAGE_KEY_CURRENT_ID, id);
}

/**
 * Obtiene el ID del presupuesto activo previamente.
 * @returns {string|null}
 */
export function getCurrentBudgetId() {
  return safeGetItem(STORAGE_KEY_CURRENT_ID);
}

/**
 * Obtiene plantillas personalizadas guardadas por el usuario.
 * @returns {Array<Object>}
 */
export function getCustomTemplates() {
  const data = safeGetItem(STORAGE_KEY_CUSTOM_TEMPLATES);
  return Array.isArray(data) ? data : [];
}

export const getSavedTemplates = getCustomTemplates;

export function saveCurrentBudget(budget) {
  return saveBudget(budget);
}

export function loadCurrentBudget() {
  const currentId = getCurrentBudgetId();
  if (currentId) {
    const found = getBudgetById(currentId);
    if (found) return found;
  }
  const all = getSavedBudgets();
  return all.length > 0 ? all[0] : null;
}

export function saveCustomTemplate(templateName, budget) {
  return saveAsCustomTemplate(budget, templateName);
}

/**
 * Guarda un presupuesto como plantilla personalizada reutilizable.
 * @param {Object} budget
 * @param {string} templateName
 * @returns {boolean}
 */
export function saveAsCustomTemplate(budget, templateName) {
  if (!budget) return false;
  const template = JSON.parse(JSON.stringify(budget));
  template.id = `custom_tpl_${Date.now()}`;
  template.name = templateName || budget.metadata?.title || 'Plantilla Personalizada';
  template.description = `Creada el ${new Date().toLocaleDateString('es-AR')}`;

  const customList = getCustomTemplates();
  customList.push(template);
  return safeSetItem(STORAGE_KEY_CUSTOM_TEMPLATES, customList);
}

/**
 * Exporta el presupuesto actual a un archivo descargable .json.
 * @param {Object} budget
 */
export function exportBudgetToJson(budget) {
  if (!budget) return;
  const filename = `Presupuesto_${(budget.metadata?.projectName || 'Audiovisual').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.json`;
  const blob = new Blob([JSON.stringify(budget, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

/**
 * Importa y valida un archivo .json de presupuesto.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function importBudgetFromJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No se seleccionó ningún archivo'));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object' || !parsed.metadata || !Array.isArray(parsed.sections)) {
          throw new Error('El archivo JSON no tiene la estructura de un presupuesto válido.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo en disco'));
    reader.readAsText(file);
  });
}
