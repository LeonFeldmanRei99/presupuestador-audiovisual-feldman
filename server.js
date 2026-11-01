import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fileURLToPath from 'url/fileURLToPath';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const BASE_DATA_DIR = path.join(__dirname, 'data');
const PRESETS_FILE = path.join(BASE_DATA_DIR, 'presets.json');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(BASE_DATA_DIR)) fs.mkdirSync(BASE_DATA_DIR, { recursive: true });

// Inicializar presets.json vacío si no existe
if (!fs.existsSync(PRESETS_FILE)) {
    fs.writeFileSync(PRESETS_FILE, '[]');
}

// === PRESETS API ===

// GET all presets
app.get('/api/presets', (req, res) => {
    try {
        const data = fs.readFileSync(PRESETS_FILE, 'utf8');
        const presets = JSON.parse(data);
        res.json(presets);
    } catch (err) {
        console.error('Error leyendo presets', err);
        res.status(500).json({ error: 'Error interno al leer presets' });
    }
});

// POST save a new preset
app.post('/api/presets', (req, res) => {
    const { name, config } = req.body;
    if (!name || config === undefined) {
        return res.status(400).json({ error: 'Name and config are required' });
    }
    try {
        let presets = [];
        if (fs.existsSync(PRESETS_FILE)) {
            const data = fs.readFileSync(PRESETS_FILE, 'utf8');
            presets = JSON.parse(data);
        }
        const newPreset = {
            id: 'preset-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
            name,
            config,
            createdAt: new Date().toISOString()
        };
        presets.push(newPreset);
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
        res.json({ success: true, preset: newPreset });
    } catch (err) {
        console.error('Error guardando preset', err);
        res.status(500).json({ error: 'Error interno al guardar preset' });
    }
});

// DELETE preset by id
app.delete('/api/presets/:id', (req, res) => {
    const { id } = req.params;
    try {
        if (!fs.existsSync(PRESETS_FILE)) {
            return res.status(404).json({ error: 'Presets not found' });
        }
        let presets = JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf8'));
        const initialLength = presets.length;
        presets = presets.filter(p => p.id !== id);
        if (presets.length === initialLength) {
            return res.status(404).json({ error: 'Preset not found' });
        }
        fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
        res.json({ success: true, message: 'Preset deleted' });
    } catch (err) {
        console.error('Error borrando preset', err);
        res.status(500).json({ error: 'Error interno al borrar preset' });
    }
});

// Start server
if (import.meta.url === fileURLToPath(new URL('file:' + process.argv[1]))) {
    app.listen(PORT, () => {
        console.log(`\n==================================================`);
        console.log(`  Servidor Node.js corriendo en http://localhost:${PORT}`);
        console.log(`  API Presets: http://localhost:${PORT}/api/presets`);
        console.log(`==================================================\n`);
    });
}

export { app };
