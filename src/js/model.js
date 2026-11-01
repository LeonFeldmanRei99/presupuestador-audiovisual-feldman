/**
 * Modelo de Datos y Plantillas Predefinidas
 * Define la estructura de presupuestos, metadatos y secciones configurables.
 */

/**
 * Genera un ID único alfanumérico para presupuestos y secciones.
 * @returns {string}
 */
export function generateId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Plantilla 1: "Jornada de rodaje"
 * Enfoque en tiempo de rodaje in situ (Half Day o Full Day) + cámara y lentes + postproducción.
 */
export const TEMPLATE_JORNADA = {
  id: 'template_jornada',
  name: 'Jornada de rodaje',
  description: 'Cotización por jornada de filmación/fotografía, equipamiento técnico propio y edición.',
  metadata: {
    title: 'Propuesta de Producción Audiovisual',
    projectName: 'Cobertura Audiovisual en Locación',
    subtitle: 'JORNADA DE RODAJE · EQUIPAMIENTO & EDICIÓN',
    client: '[Nombre del Cliente / Empresa]',
    attention: '[Nombre del Contacto / Responsable]',
    date: '31 · 10 · 2026',
    validity: '15 días corridos',
    locations: '[Locación a convenir]',
    summary: 'Servicio integral de registro audiovisual en locación con equipamiento cinematográfico profesional. La propuesta contempla jornada de rodaje continuo, captura de sonido directo, iluminación de apoyo y posterior montaje, colorimetría y masterización.',
    currency: 'ARS',
    discountPercent: 0,
    taxPercent: 0,
    anticipoPercent: 50,
    authorName: 'LEÓN FELDMAN REINOSO',
    authorRole: 'Dirección de Fotografía & Realización Audiovisual',
    portfolioUrl: 'https://leonfeldmanreino.myportfolio.com'
  },
  sections: [
    {
      id: generateId('sec'),
      type: 'jornadas',
      numeral: 'I',
      title: 'ALCANCE DE RODAJE EN LOCACIÓN',
      subtitle: 'PLAN DE RODAJE & COBERTURA TÉCNICA',
      items: [
        {
          id: generateId('jor'),
          title: 'JORNADA ÚNICA · COBERTURA COMPLETA',
          durationBadge: '6 HORAS EN LOCACIÓN',
          detail: 'Plan de rodaje cinematográfico y fotográfico. Registro con ópticas fijas y zoom de alta gama, iluminación de apoyo, estabilizador y microfonía inalámbrica profesional.',
          deliverablesNote: 'Genera: Tomas base para edición de video final + selección curada de fotos editadas.'
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'deliverables',
      numeral: 'II',
      title: 'LISTADO DE ENTREGABLES FINALES',
      subtitle: 'DELIMITACIÓN DE ALCANCE',
      items: [
        {
          id: generateId('deliv'),
          title: '01 Video Resumen / Institucional (16:9 y 9:16)',
          description: 'Duración de hasta 90 segundos, edición dinámica, corrección de color cinemática y subtitulado.'
        },
        {
          id: generateId('deliv'),
          title: '20 Fotografías Digitales Editadas',
          description: 'Selección y revelado profesional en alta resolución para web, prensa y catálogo.'
        },
        {
          id: generateId('deliv'),
          title: 'Archivos Master Finales',
          description: 'Entrega final vía enlace de descarga de alta velocidad en 4K UHD y Full HD 1080p.'
        }
      ],
      scopeWarning: '* Cláusula de alcance: Todo entregable, jornada adicional o versión no especificada explícitamente se presupuestará por separado previa aprobación.'
    },
    {
      id: generateId('sec'),
      type: 'financial',
      numeral: 'III',
      title: 'HONORARIOS DE PRODUCCIÓN',
      subtitle: 'RODAJE + PRE + POST + EQUIPO',
      items: [
        {
          id: generateId('fin'),
          desc: 'Jornada de Rodaje Técnico & Dirección',
          subtext: 'Pre-producción, coordinación previa y 6 horas de rodaje en locación con cámara Cinema Line',
          quantity: 1,
          unit: 'jornada',
          unitPrice: 240000
        },
        {
          id: generateId('fin'),
          desc: 'Postproducción, Edición & Color Grading',
          subtext: 'Ingesta de material, montaje de video institucional, diseño sonoro y corrección de color',
          quantity: 1,
          unit: 'global',
          unitPrice: 180000
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'financial',
      numeral: 'IV',
      title: 'GASTOS ADICIONALES & LOGÍSTICA',
      subtitle: 'COSTOS OPERATIVOS SEPARADOS',
      items: [
        {
          id: generateId('fin'),
          desc: 'Movilidad, Traslado de Equipos & Viáticos',
          subtext: 'Combustible, peajes y traslado seguro de equipamiento técnico hasta la locación',
          quantity: 1,
          unit: 'viaje',
          unitPrice: 35000
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'conditions',
      numeral: 'V',
      title: 'CONDICIONES DEL SERVICIO',
      subtitle: 'TÉRMINOS CONTRACTUALES',
      items: [
        {
          id: generateId('cond'),
          heading: 'FORMA DE PAGO',
          body: 'Anticipo del 50% al confirmar la propuesta para reserva de agenda. Saldo restante del 50% contra entrega de los archivos finales aprobados.'
        },
        {
          id: generateId('cond'),
          heading: 'RONDAS DE REVISIÓN',
          body: 'Incluye hasta 2 rondas de ajustes de edición y color sobre las piezas listadas. Rondas posteriores se cotizan por separado a valor hora de edición.'
        },
        {
          id: generateId('cond'),
          heading: 'REPROGRAMACIONES & CLIMA',
          body: 'Avisos con al menos 48 hs de antelación. En caso de mal tiempo en exteriores o fuerza mayor, se reasigna fecha sin costo adicional.'
        },
        {
          id: generateId('cond'),
          heading: 'DERECHOS DE USO',
          body: 'Licencia de uso comercial y publicitario sin vencimiento temporal para todos los canales digitales propios del cliente.'
        }
      ]
    }
  ]
};

/**
 * Plantilla 2: "Mensual con varias visitas"
 * Esquema de fee mensual / retainer con visitas programadas, ideal para creadores de contenido y agencias.
 */
export const TEMPLATE_MENSUAL = {
  id: 'template_mensual',
  name: 'Mensual con varias visitas',
  description: 'Abono recurrente mensual con múltiples visitas de cobertura en locación y entregables periódicos.',
  metadata: {
    title: 'Propuesta de Producción Mensual',
    projectName: 'Campaña Continua de Contenidos Digitales',
    subtitle: 'COBERTURA PERIÓDICA EN LOCACIÓN & ACTIVOS VERTICALES',
    client: '[Nombre del Cliente / Empresa]',
    attention: '[Nombre del Contacto / Responsable]',
    date: '31 · 10 · 2026',
    validity: '15 días corridos',
    locations: '[Locación 01 y Locación 02]',
    summary: 'Plan mensual de generación continua de contenidos audiovisuales y fotográficos de alto impacto. La propuesta contempla dos visitas de rodaje in situ por mes con equipamiento cinematográfico, registro fotográfico en alta resolución, montaje de piezas en formato vertical 9:16 y curaduría de colorimetría para redes sociales.',
    currency: 'ARS',
    discountPercent: 0,
    taxPercent: 0,
    anticipoPercent: 50,
    authorName: 'LEÓN FELDMAN REINOSO',
    authorRole: 'Dirección de Fotografía & Realización Audiovisual',
    portfolioUrl: 'https://leonfeldmanreino.myportfolio.com'
  },
  sections: [
    {
      id: generateId('sec'),
      type: 'jornadas',
      numeral: 'I',
      title: 'ALCANCE DE RODAJE POR JORNADA',
      subtitle: 'PLAN DE VISITAS PROGRAMADAS',
      items: [
        {
          id: generateId('jor'),
          title: 'JORNADA 01 · VISITA LOCACIÓN A',
          durationBadge: '3 HORAS EN LOCACIÓN',
          detail: 'Registro cinematográfico y fotográfico de instalaciones, infraestructura, procesos de trabajo y tomas de contexto. Plan de tomas con ópticas fijas y zoom.',
          deliverablesNote: 'Genera: Tomas base para Reels verticales + selección de 15 fotos editadas.'
        },
        {
          id: generateId('jor'),
          title: 'JORNADA 02 · VISITA LOCACIÓN B',
          durationBadge: '3 HORAS EN LOCACIÓN',
          detail: 'Cobertura de dinámicas operativas, interacción con el espacio, detalles de servicio y testimoniales breves. Iluminación puntual y sonido directo.',
          deliverablesNote: 'Genera: Tomas base para Reels verticales + selección de 15 fotos editadas.'
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'deliverables',
      numeral: 'II',
      title: 'LISTADO DE ENTREGABLES MENSUALES',
      subtitle: 'DELIMITACIÓN DE ALCANCE',
      items: [
        {
          id: generateId('deliv'),
          title: '04 Reels Editados en Vertical (9:16)',
          description: 'De hasta 60 segundos, ritmo dinámico, subtitulado sincronizado y color grade cinemático para Instagram, TikTok y LinkedIn.'
        },
        {
          id: generateId('deliv'),
          title: '30 Fotografías Digitales Editadas',
          description: 'Selección curada en alta resolución para prensa/catálogo más versiones livianas para feed de redes.'
        },
        {
          id: generateId('deliv'),
          title: 'Archivos Master de Archivo',
          description: 'Entrega vía enlace cloud en resoluciones 4K UHD y Full HD 1080p.'
        }
      ],
      scopeWarning: '* Cláusula de alcance: Todo entregable, versión, jornada extra o locación no contemplada explícitamente se cotizará por separado previa aprobación.'
    },
    {
      id: generateId('sec'),
      type: 'financial',
      numeral: 'III',
      title: 'HONORARIOS MENSUALES DE PRODUCCIÓN',
      subtitle: '2 JORNADAS + PRE + EDICIÓN + EQUIPAMIENTO',
      items: [
        {
          id: generateId('fin'),
          desc: 'Jornada 01 · Locación A (Rodaje, Pre & Post)',
          subtext: 'Pre-producción + 3hs rodaje en locación + equipamiento técnico propio + montaje de reels y retoque',
          quantity: 1,
          unit: 'visita',
          unitPrice: 280000
        },
        {
          id: generateId('fin'),
          desc: 'Jornada 02 · Locación B (Rodaje, Pre & Post)',
          subtext: 'Pre-producción + 3hs rodaje en locación + equipamiento técnico propio + montaje de reels y retoque',
          quantity: 1,
          unit: 'visita',
          unitPrice: 280000
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'financial',
      numeral: 'IV',
      title: 'GASTOS ADICIONALES & LOGÍSTICA',
      subtitle: 'COSTOS OPERATIVOS SEPARADOS',
      items: [
        {
          id: generateId('fin'),
          desc: 'Traslados, Movilidad & Viáticos Operativos',
          subtext: 'Logística vehicular de traslado de equipamiento, peajes y combustible para ambas visitas',
          quantity: 2,
          unit: 'traslado',
          unitPrice: 22500
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'conditions',
      numeral: 'V',
      title: 'CONDICIONES DEL SERVICIO',
      subtitle: 'TÉRMINOS CONTRACTUALES',
      items: [
        {
          id: generateId('cond'),
          heading: 'MODALIDAD DE PAGO',
          body: 'Anticipo del 50% al inicio de cada mes para reserva de calendario. Saldo restante del 50% contra entrega de las piezas del período.'
        },
        {
          id: generateId('cond'),
          heading: 'RONDAS DE REVISIÓN',
          body: 'Incluye hasta 2 rondas de ajustes de edición sobre cada pieza. Ajustes estructurales de guion posteriores se cotizan por separado.'
        },
        {
          id: generateId('cond'),
          heading: 'REPROGRAMACIONES & CLIMA',
          body: 'Aviso de reprogramación con al menos 48 hs de antelación. En caso de mal clima para tomas exteriores, se reasigna fecha sin penalidad.'
        },
        {
          id: generateId('cond'),
          heading: 'DERECHOS DE USO',
          body: 'Licencia de uso comercial y publicitario sin vencimiento temporal para todos los canales digitales del cliente.'
        }
      ]
    }
  ]
};

/**
 * Plantilla 3: "Entregable por pieza"
 * Cotización por pieza final terminada (Cápsula, Reel o Spot unitario con producción completa incluida).
 */
export const TEMPLATE_PIEZA = {
  id: 'template_pieza',
  name: 'Entregable por pieza',
  description: 'Cotización cerrada por cantidad de piezas finales producidas y entregadas.',
  metadata: {
    title: 'Propuesta de Producción por Pieza',
    projectName: 'Producción de Piezas Publicitarias Específicas',
    subtitle: 'COTIZACIÓN CERRADA POR ACTIVO FINAL TERMINADO',
    client: '[Nombre del Cliente / Empresa]',
    attention: '[Nombre del Contacto / Responsable]',
    date: '31 · 10 · 2026',
    validity: '15 días corridos',
    locations: '[Estudio / Locación]',
    summary: 'Producción audiovisual y fotográfica tarifada por activo final aprobado. Incluye todas las etapas de realización necesarias para cada pieza (conceptualización, rodaje en estudio o locación, montaje, musicalización y entrega master).',
    currency: 'ARS',
    discountPercent: 0,
    taxPercent: 0,
    anticipoPercent: 50,
    authorName: 'LEÓN FELDMAN REINOSO',
    authorRole: 'Dirección de Fotografía & Realización Audiovisual',
    portfolioUrl: 'https://leonfeldmanreino.myportfolio.com'
  },
  sections: [
    {
      id: generateId('sec'),
      type: 'deliverables',
      numeral: 'I',
      title: 'ESPECIFICACIÓN DE PIEZAS FINALES',
      subtitle: 'ENTREGABLES COMPROMETIDOS',
      items: [
        {
          id: generateId('deliv'),
          title: 'Spot / Cápsula Principal (Hasta 45s)',
          description: 'Formato vertical 9:16 y horizontal 16:9, ritmo dinámico, subtítulos, voz en off sincronizada y masterización de audio.'
        },
        {
          id: generateId('deliv'),
          title: 'Teaser / Micro-video (Hasta 15s)',
          description: 'Adaptación corta de alto impacto para Instagram Stories, TikTok y campañas de pauta publicitaria.'
        },
        {
          id: generateId('deliv'),
          title: 'Set de 10 Fotos Fijas de Producto / Escena',
          description: 'Retoque fotográfico de alta gama para portada, carruseles y material de prensa.'
        }
      ],
      scopeWarning: '* El valor unitario comprende pre-producción, rodaje y post-producción completa para la cantidad de piezas contratadas.'
    },
    {
      id: generateId('sec'),
      type: 'financial',
      numeral: 'II',
      title: 'COTIZACIÓN POR ENTREGABLE',
      subtitle: 'PRECIO CERRADO POR PIEZA',
      items: [
        {
          id: generateId('fin'),
          desc: 'Spot / Cápsula Principal (Rodaje + Edición)',
          subtext: 'Incluye jornada de filmación, iluminación, cámara Cinema Line, montaje y color grading completo',
          quantity: 1,
          unit: 'pieza',
          unitPrice: 320000
        },
        {
          id: generateId('fin'),
          desc: 'Teasers / Micro-videos para Pauta Digital',
          subtext: 'Edición derivada de las tomas del spot con llamado a la acción específico',
          quantity: 2,
          unit: 'pieza',
          unitPrice: 85000
        },
        {
          id: generateId('fin'),
          desc: 'Fotografías de Producto / Escena Retocadas',
          subtext: 'Captura y revelado profesional en alta resolución',
          quantity: 10,
          unit: 'foto',
          unitPrice: 12000
        }
      ]
    },
    {
      id: generateId('sec'),
      type: 'conditions',
      numeral: 'III',
      title: 'CONDICIONES DEL SERVICIO',
      subtitle: 'TÉRMINOS CONTRACTUALES',
      items: [
        {
          id: generateId('cond'),
          heading: 'FORMA DE PAGO',
          body: '50% anticipo al iniciar la producción para reserva de fechas y costos operativos. 50% final contra entrega de masters definitivos.'
        },
        {
          id: generateId('cond'),
          heading: 'RONDAS DE REVISIÓN',
          body: 'Incluye hasta 2 rondas de ajustes de edición sobre el corte preliminar de cada pieza contratada.'
        },
        {
          id: generateId('cond'),
          heading: 'DERECHOS DE USO',
          body: 'Licencia de uso publicitario digital sin límite temporal para las piezas entregadas.'
        }
      ]
    }
  ]
};

/**
 * Catálogo de plantillas predefinidas del sistema.
 */
export const DEFAULT_TEMPLATES = Object.assign(
  [TEMPLATE_MENSUAL, TEMPLATE_JORNADA, TEMPLATE_PIEZA],
  {
    mensual: TEMPLATE_MENSUAL,
    jornada: TEMPLATE_JORNADA,
    pieza: TEMPLATE_PIEZA
  }
);

/**
 * Clona profundamente un objeto de presupuesto o plantilla para editarlo sin mutar el original.
 * Genera nuevos IDs para evitar colisiones.
 * @param {Object} template
 * @returns {Object}
 */
export function cloneBudget(template) {
  const cloned = JSON.parse(JSON.stringify(template));
  cloned.id = generateId('budget');
  cloned.createdAt = new Date().toISOString();
  cloned.updatedAt = new Date().toISOString();

  // Renovar IDs de secciones e ítems
  if (Array.isArray(cloned.sections)) {
    cloned.sections.forEach(sec => {
      sec.id = generateId('sec');
      if (Array.isArray(sec.items)) {
        sec.items.forEach(item => {
          item.id = generateId('item');
        });
      }
    });
  }

  return cloned;
}

/**
 * Crea un presupuesto nuevo en blanco con valores por defecto.
 * @returns {Object}
 */
export function createEmptyBudget() {
  return {
    id: generateId('budget'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      title: 'Presupuesto de Producción',
      projectName: 'Nuevo Proyecto Audiovisual',
      subtitle: 'RODAJE EN LOCACIÓN & POSTPRODUCCIÓN',
      client: '[Nombre del Cliente / Empresa]',
      attention: '[Nombre del Contacto / Responsable]',
      date: new Date().toLocaleDateString('es-AR'),
      validity: '15 días corridos',
      locations: '[A convenir]',
      summary: 'Descripción breve de los objetivos, estética y requerimientos técnicos del proyecto.',
      currency: 'ARS',
      discountPercent: 0,
      taxPercent: 0,
      anticipoPercent: 50,
      authorName: 'LEÓN FELDMAN REINOSO',
      authorRole: 'Dirección de Fotografía & Realización Audiovisual',
      portfolioUrl: 'https://leonfeldmanreino.myportfolio.com'
    },
    sections: [
      {
        id: generateId('sec'),
        type: 'financial',
        numeral: 'I',
        title: 'HONORARIOS & SERVICIOS',
        subtitle: 'DETALLE DE RUBROS Y TARIFA',
        items: [
          {
            id: generateId('fin'),
            desc: 'Servicio de Realización Audiovisual',
            subtext: 'Detalle de la tarea, horas o equipamiento incluido',
            quantity: 1,
            unit: 'global',
            unitPrice: 250000
          }
        ]
      },
      {
        id: generateId('sec'),
        type: 'conditions',
        numeral: 'II',
        title: 'CONDICIONES DEL SERVICIO',
        subtitle: 'TÉRMINOS CONTRACTUALES',
        items: [
          {
            id: generateId('cond'),
            heading: 'FORMA DE PAGO',
            body: '50% anticipo al confirmar y 50% contra entrega final aprobada.'
          },
          {
            id: generateId('cond'),
            heading: 'RONDAS DE REVISIÓN',
            body: 'Incluye hasta 2 instancias de ajustes sobre el material entregado.'
          }
        ]
      }
    ]
  };
}
