# Cotizador Audiovisual Profesional (Formato Editorial A4)

Aplicación web modular en JavaScript Vanilla y CSS puro para diseñar, personalizar, calcular y exportar presupuestos y propuestas de producción audiovisual (fotografía, video, drone y contenido para redes) en **español rioplatense neutro**, optimizada para el mercado de Argentina y Latinoamérica.

---

## 📋 Características Principales

1. **Estética Editorial de Alta Gama:**
   - Tipografía refinada: *Cormorant Garamond* (títulos y acentos serif clásicos) e *Inter* (lectura técnica, números tabulares).
   - Paleta sobria de tono hueso/lino cálido (`#F2EEE6`), tinta neutra grafito (`#1A1A1A`) y filetes ultrafinos de 0.5pt.
   - Puntuación con líneas de puntos continuas (*dot leaders*) alineadas al milímetro para montos.

2. **Modelo Modular y Cálculo Financiero Preciso:**
   - Cálculo automático de subtotales por ítem, subtotales por sección y totales acumulados.
   - Descuentos comerciales configurables (en porcentaje).
   - Alícuotas fiscales configurables (IVA 21%, Exento / Monotributo 0%, o retenciones locales).
   - Esquemas de anticipo configurables (por defecto 50% al reservar fecha, 50% contra entrega final).
   - Soporte multimoneda: **ARS** (`$`) y **USD** (`US$`), con formateador regional respetando separadores de miles y decimales.

3. **Estructura Flexible y Reordenable:**
   - Secciones de presupuesto financiero (líneas con cantidad, unidad, precio unitario y subtotal).
   - Secciones de cronograma de jornadas (visitas, locaciones, tiempos estimados, objetivos de rodaje).
   - Secciones de catálogo de entregables (formatos de video, relación de aspecto, resolución y cantidades).
   - Secciones de condiciones comerciales y legales (validez, revisiones, cancelaciones, derechos patrimoniales).
   - Reordenamiento vertical (subir/bajar secciones), duplicación instantánea de jornadas completas y adición de secciones personalizadas.

4. **Exportación Impecable a PDF (Sin Dependencias Pesadas):**
   - Hoja A4 estricta (`210mm x 297mm`) con márgenes de 15mm.
   - Estilos `@media print` dedicados que eliminan controles, barras de herramientas y fondos oscuros de edición.
   - Saltos de página inteligentes (`break-inside: avoid` en secciones y totales).
   - Uso directo de la función de impresión nativa del navegador (`Ctrl + P` o botón *Exportar PDF*).

5. **Persistencia y Resiliencia en Almacenamiento:**
   - Auto-guardado transparente en `localStorage` encapsulado con `try/catch`.
   - Mecanismo de contingencia en memoria volatil si `localStorage` está bloqueado (navegación privada estricta o cuota excedida).
   - Importación y exportación de archivos de respaldo `.json` para mover presupuestos y plantillas entre computadoras.

6. **Diseño Responsivo:**
   - En pantallas de escritorio: interfaz dividida (panel de edición a la izquierda, hoja editorial A4 en vivo a la derecha).
   - En dispositivos móviles: pestañas dedicadas *"Editar Presupuesto"* y *"Vista Previa A4"*, garantizando 100% de usabilidad sin desbordes horizontales ni zooms incómodos.

---

## 🚀 Cómo Correr el Proyecto

La aplicación está construida enteramente sobre estándares web nativos (HTML5, CSS3, ES Modules). No requiere ningún paso de compilación (*build step*) ni instalación obligatoria de paquetes npm para funcionar.

### Opción 1: Servidor web local ligero (Recomendado)
Para cargar correctamente los módulos de JavaScript (`type="module"`), utilizá cualquier servidor estático:

```bash
# Con npx (Node.js)
npx serve .

# O con Python 3
python -m http.server 8080

# O con la extensión "Live Server" de VS Code / IDE
```
Luego abrí `http://localhost:3000` (o el puerto indicado) en tu navegador preferido (Chrome, Firefox, Safari o Edge).

---

## 🧪 Tests de Cálculo Automatizados

La lógica de cálculo financiero está aislada en un módulo puro (`src/js/calc.js`) y cuenta con una suite completa de pruebas unitarias que validan:
- Sanitización de números y cadenas de texto.
- Cálculo de subtotales por línea y multiplicación de cantidades.
- Acumulación de subtotales por sección.
- Aplicación de porcentajes de descuento, IVA y cálculo de anticipos.
- Formateo de moneda regional en ARS y USD.

Para ejecutar los tests nativos de Node.js:

```bash
# Con Node.js nativo (recomendado en cualquier plataforma)
node --test tests/calc.test.mjs

# O vía npm (en Windows PowerShell si las políticas de script restringen .ps1, usar npm.cmd)
npm test
# o
npm.cmd test
```

---

## 📁 Estructura del Código

```text
├── docs/
│   └── investigacion-formatos.md # Investigación del mercado audiovisual (fuentes y análisis)
├── src/
│   ├── css/
│   │   ├── main.css              # Estilos del editor oscuro, layout responsivo y hoja A4
│   │   └── print.css             # Reglas estrictas de impresión A4 para PDF
│   └── js/
│       ├── model.js              # Esquema de datos y 3 plantillas predeterminadas de la industria
│       ├── calc.js               # Funciones puras de cálculo financiero y formateo
│       ├── storage.js            # Capa segura de persistencia (localStorage + backup JSON)
│       ├── ui.js                 # Renderizado reactivo del editor y previsualización editorial
│       └── app.js                # Orquestador principal de eventos y estado global
├── tests/
│   └── calc.test.mjs             # Pruebas unitarias para calc.js
├── index.html                    # Entrada principal de la aplicación web
└── package.json                  # Definición de scripts y módulo ES
```

---

## 📑 De Dónde Salió Cada Decisión (Investigación Previa)

El diseño de la aplicación y la estructura de sus plantillas se fundamentan en el informe exhaustivo documentado en [`docs/investigacion-formatos.md`](docs/investigacion-formatos.md):

1. **Estructura de Secciones por Rubros:**
   - La separación de *Datos del Proyecto*, *Jornadas*, *Entregables*, *Honorarios/Gastos* y *Condiciones* responde a los estándares observados en productoras de la **CAPPA** y agencias de la **CADAC**. Permite que el cliente corporativo o institucional comprenda de inmediato el valor agregado sin mezclar costos logísticos con honorarios autorales.

2. **Las 3 Plantillas Base:**
   - **Jornada de rodaje / sesión (Foto y Video):** Basada en el tarifario de referencia de la **ADF** (Autores de Fotografía Cinematográfica) y **SICA-APMA**, donde la unidad fundamental de contratación técnica es la jornada estándar (8 a 10 hs).
   - **Mensual con varias visitas (Retainer de Redes / Marcas):** Adaptada a la práctica contemporánea de agencias y creadores de contenido freelance, donde se combinan visitas periódicas de relevamiento de contenido con un paquete mensual cerrado de entregables optimizados para reels/TikTok/carruseles.
   - **Entregable por pieza cerrada (Comercial / Institucional):** Estructura orientada a valor por entregable terminado (con pre-producción, rodaje y post-producción integral absorbida en el costo de la pieza).

3. **Condiciones Comerciales Estándar:**
   - **Anticipo del 50%:** Práctica habitual en productoras independientes en Argentina para congelar fechas en agenda y cubrir alquiler de equipo especializado o seguros de accidentes personales (AP).
   - **2 Rondas de Modificaciones:** Cláusula estricta para evitar la corrupción de alcance (*scope creep*) sin recargo. Las correcciones adicionales se estipulan por hora de post-producción.
   - **Política de Cancelación (48 hs):** Indemnización del 50% si la postergación o cancelación ocurre con menos de 48 horas de anticipación, compensando la pérdida de lucro cesante del equipo técnico.
   - **Derechos de Uso y Propiedad Intelectual:** Basado en la **Ley Nacional N° 11.723** de la República Argentina (derecho moral inalienable del autor y cesión patrimonial no exclusiva limitada al uso y plataformas presupuestadas).

---

## 🛠️ Cómo Crear y Modificar Plantillas

### 1. Desde la Interfaz Web (Sin Programar)
1. Abrí la aplicación en tu navegador.
2. Podés partir de una plantilla existente seleccionándola en el menú **"📂 Cargar plantilla..."** o hacer clic en **"✨ Nuevo"** para un presupuesto en blanco.
3. Editá los datos del cliente, modificá las líneas de costo, cambiá la moneda o agregá nuevas secciones con el botón **"+ Agregar Sección"**.
4. Hacé clic en **"💾 Guardar Plantilla"**.
5. Ingresá el nombre que deseás para tu plantilla (por ejemplo: *"Sesión Corporativa de Retratos"*, *"Cobertura de Evento Social"*).
6. La plantilla quedará almacenada en tu navegador y aparecerá listada bajo la categoría **"⭐ Tus plantillas guardadas"** en el selector desplegable.

### 2. Programáticamente en el Código (`src/js/model.js`)
Si deseás integrar una nueva plantilla oficial de fábrica:
1. Abrí el archivo [`src/js/model.js`](file:///src/js/model.js).
2. Definí un nuevo objeto siguiendo la estructura de `TEMPLATE_JORNADA` o `TEMPLATE_MENSUAL`:
   ```javascript
   export const TEMPLATE_EVENTO = {
     title: "Cobertura Audiovisual de Evento",
     number: "COT-EV-001",
     client: {
       name: "Nombre de la Empresa",
       attention: "Persona de Contacto",
       date: "...",
       validityDays: 15,
       currency: "ARS",
       projectDescription: "Cobertura fotográfica y resumen en video del evento anual."
     },
     sections: [
       // Secciones de tipo: 'financial', 'jornadas', 'deliverables', 'conditions'
     ],
     financial: {
       discountPercent: 0,
       taxPercent: 0,
       taxLabel: "IVA (21%)",
       advancePercent: 50
     }
   };
   ```
3. Registrala dentro del diccionario `DEFAULT_TEMPLATES` en [`src/js/model.js`](file:///src/js/model.js) y sumala a las opciones del menú en [`src/js/app.js`](file:///src/js/app.js).

---

## ⚠️ Descargo y Criterio Comercial

> **AVISO IMPORTANTE:**  
> Los valores monetarios, cantidades, porcentajes de descuento, plazos y cláusulas contractuales incluidos en las plantillas predeterminadas constituyen **únicamente ejemplos demostrativos y referenciales** para ilustrar la operatoria del sistema.  
>  
> Esta herramienta **no impone tarifas fijas ni criterios comerciales obligatorios**. Cada profesional audiovisual o productora debe definir de forma autónoma sus precios, márgenes de utilidad, esquemas impositivos (según su condición fiscal frente a AFIP/ARCA e Ingresos Brutos) y condiciones legales específicas en los campos configurables que proporciona el sistema.
