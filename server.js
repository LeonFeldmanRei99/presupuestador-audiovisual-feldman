import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir archivos estáticos de la aplicación (index.html, qrcode.min.js, src/, etc.)
app.use(express.static(__dirname));

const BASE_DATA_DIR = path.join(__dirname, 'data');
const PRESETS_FILE = path.join(BASE_DATA_DIR, 'presets.json');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(BASE_DATA_DIR)) {
  fs.mkdirSync(BASE_DATA_DIR, { recursive: true });
}

// Inicializar presets.json vacío si no existe
if (!fs.existsSync(PRESETS_FILE)) {
  fs.writeFileSync(PRESETS_FILE, '[]', 'utf8');
}

function readPresetsFromDisk() {
  try {
    if (!fs.existsSync(PRESETS_FILE)) return [];
    const data = fs.readFileSync(PRESETS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error leyendo presets desde disco:', err);
    return [];
  }
}

function writePresetsToDisk(presets) {
  if (!fs.existsSync(BASE_DATA_DIR)) {
    fs.mkdirSync(BASE_DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2), 'utf8');
}

// === PRESETS API ===

// GET all presets
app.get('/api/presets', (req, res) => {
  try {
    const presets = readPresetsFromDisk();
    res.json(presets);
  } catch (err) {
    console.error('Error leyendo presets:', err);
    res.status(500).json({ error: 'Error interno al leer presets' });
  }
});

// POST save or update a preset
app.post('/api/presets', (req, res) => {
  const { id, name, description, config } = req.body;
  if (!name || config === undefined) {
    return res.status(400).json({ error: 'Name and config are required' });
  }
  try {
    const presets = readPresetsFromDisk();
    const now = new Date().toISOString();

    if (id) {
      const existingIdx = presets.findIndex(p => p.id === id);
      if (existingIdx !== -1) {
        presets[existingIdx] = {
          ...presets[existingIdx],
          name,
          description: description || presets[existingIdx].description || '',
          config,
          updatedAt: now
        };
        writePresetsToDisk(presets);
        return res.json({ success: true, preset: presets[existingIdx] });
      }
    }

    const newPreset = {
      id: id || ('preset-' + Date.now() + '-' + Math.floor(Math.random() * 10000)),
      name,
      description: description || '',
      config,
      createdAt: now,
      updatedAt: now
    };
    presets.unshift(newPreset);
    writePresetsToDisk(presets);
    res.json({ success: true, preset: newPreset });
  } catch (err) {
    console.error('Error guardando preset:', err);
    res.status(500).json({ error: 'Error interno al guardar preset' });
  }
});

// PUT update preset by id
app.put('/api/presets/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, config } = req.body;
  try {
    const presets = readPresetsFromDisk();
    const idx = presets.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Preset not found' });
    }
    presets[idx] = {
      ...presets[idx],
      name: name ?? presets[idx].name,
      description: description ?? presets[idx].description,
      config: config !== undefined ? config : presets[idx].config,
      updatedAt: new Date().toISOString()
    };
    writePresetsToDisk(presets);
    res.json({ success: true, preset: presets[idx] });
  } catch (err) {
    console.error('Error actualizando preset:', err);
    res.status(500).json({ error: 'Error interno al actualizar preset' });
  }
});

// DELETE preset by id
app.delete('/api/presets/:id', (req, res) => {
  const { id } = req.params;
  try {
    const presets = readPresetsFromDisk();
    const filtered = presets.filter(p => p.id !== id);
    if (filtered.length === presets.length) {
      return res.status(404).json({ error: 'Preset not found' });
    }
    writePresetsToDisk(filtered);
    res.json({ success: true, message: 'Preset deleted' });
  } catch (err) {
    console.error('Error borrando preset:', err);
    res.status(500).json({ error: 'Error interno al borrar preset' });
  }
});

// Iniciar servidor cuando se ejecuta directamente (node server.js)
const isMain = process.argv[1] && path.resolve(__filename) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`  Servidor Node.js corriendo en http://localhost:${PORT}`);
    console.log(`  API Presets: http://localhost:${PORT}/api/presets`);
    console.log(`==================================================\n`);
  });
}

export { app };
