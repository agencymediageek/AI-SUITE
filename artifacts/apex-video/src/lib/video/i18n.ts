export type Lang = 'en' | 'pt' | 'es';

export const VIDEO_I18N = {
  scene1: {
    tagline: {
      en: 'AI THAT CONDUCTS YOUR MEETINGS',
      pt: 'A IA QUE CONDUZ SUAS REUNIÕES',
      es: 'LA IA QUE DIRIGE TUS REUNIONES',
    },
  },
  scene2: {
    header: {
      en: 'MEETING CONFIGURATION',
      pt: 'CONFIGURAÇÃO DE REUNIÃO',
      es: 'CONFIGURACIÓN DE REUNIÓN',
    },
    pressStart: {
      en: 'PRESS START TO ACTIVATE_',
      pt: 'PRESSIONE INICIAR PARA ATIVAR_',
      es: 'PRESIONE INICIO PARA ACTIVAR_',
    },
    items: {
      en: [
        { label: 'LANGUAGE',       value: 'PT-BR / EN / ES'   },
        { label: 'AI NAME',        value: 'APEX_ASSISTANT_01' },
        { label: 'VOICE_ENABLED',  value: 'TRUE'              },
        { label: 'CAMERA_ENABLED', value: 'TRUE'              },
        { label: 'SITE_BUILDER',   value: 'ACTIVE'            },
        { label: 'DOCUMENT_GEN',   value: 'ACTIVE'            },
        { label: 'DNS_CONFIG',     value: 'AUTO'              },
      ],
      pt: [
        { label: 'IDIOMA',          value: 'PT-BR / EN / ES'   },
        { label: 'NOME_IA',         value: 'APEX_ASSISTANT_01' },
        { label: 'VOZ_ATIVADA',     value: 'VERDADEIRO'        },
        { label: 'CÂMERA_ATIVADA',  value: 'VERDADEIRO'        },
        { label: 'CRIADOR_SITE',    value: 'ATIVO'             },
        { label: 'GERADOR_DOC',     value: 'ATIVO'             },
        { label: 'CONFIG_DNS',      value: 'AUTO'              },
      ],
      es: [
        { label: 'IDIOMA',          value: 'PT-BR / EN / ES'   },
        { label: 'NOMBRE_IA',       value: 'APEX_ASSISTANT_01' },
        { label: 'VOZ_ACTIVADA',    value: 'VERDADERO'         },
        { label: 'CÁMARA_ACTIVADA', value: 'VERDADERO'         },
        { label: 'CREADOR_SITIO',   value: 'ACTIVO'            },
        { label: 'GENERADOR_DOC',   value: 'ACTIVO'            },
        { label: 'CONFIG_DNS',      value: 'AUTO'              },
      ],
    },
  },
  scene3: {
    sessionActive: { en: 'SESSION ACTIVE',  pt: 'SESSÃO ATIVA',   es: 'SESIÓN ACTIVA'   },
    listening:     { en: 'LISTENING',        pt: 'OUVINDO',        es: 'ESCUCHANDO'      },
    processing:    { en: 'PROCESSING',       pt: 'PROCESSANDO',    es: 'PROCESANDO'      },
    executing:     { en: 'EXECUTING',        pt: 'EXECUTANDO',     es: 'EJECUTANDO'      },
  },
  scene4: {
    lines: {
      en: [
        '> INITIALIZING SESSION...',
        '[ OK ] SESSION ID: APEX-2024-04X71',
        '',
        '> BUILDING WEBSITE...',
        '[ OK ] SITE LIVE AT: https://meeting-report-04x71.techsites.ai',
        '',
        '> CONFIGURING DNS...',
        '[ OK ] DNS RECORDS UPDATED',
        '[ OK ] SSL CERTIFICATE ISSUED',
        '',
        '> GENERATING DOCUMENT...',
        '[ OK ] MEETING MINUTES: meeting_04x71_minutes.pdf',
        '[ OK ] ACTION ITEMS: meeting_04x71_tasks.pdf',
        '',
        '> PUBLISHING ASSETS...',
        '[ OK ] DOCUMENTS PUBLISHED TO CLOUD',
        '[ OK ] SITE DEPLOYED',
        '',
        'SESSION COMPLETE.',
      ],
      pt: [
        '> INICIANDO SESSÃO...',
        '[ OK ] ID DA SESSÃO: APEX-2024-04X71',
        '',
        '> CONSTRUINDO SITE...',
        '[ OK ] SITE AO VIVO EM: https://meeting-report-04x71.techsites.ai',
        '',
        '> CONFIGURANDO DNS...',
        '[ OK ] REGISTROS DNS ATUALIZADOS',
        '[ OK ] CERTIFICADO SSL EMITIDO',
        '',
        '> GERANDO DOCUMENTO...',
        '[ OK ] ATA DA REUNIÃO: meeting_04x71_ata.pdf',
        '[ OK ] ITENS DE AÇÃO: meeting_04x71_tarefas.pdf',
        '',
        '> PUBLICANDO ARQUIVOS...',
        '[ OK ] DOCUMENTOS PUBLICADOS NA NUVEM',
        '[ OK ] SITE PUBLICADO',
        '',
        'SESSÃO COMPLETA.',
      ],
      es: [
        '> INICIANDO SESIÓN...',
        '[ OK ] ID DE SESIÓN: APEX-2024-04X71',
        '',
        '> CONSTRUYENDO SITIO...',
        '[ OK ] SITIO EN VIVO EN: https://meeting-report-04x71.techsites.ai',
        '',
        '> CONFIGURANDO DNS...',
        '[ OK ] REGISTROS DNS ACTUALIZADOS',
        '[ OK ] CERTIFICADO SSL EMITIDO',
        '',
        '> GENERANDO DOCUMENTO...',
        '[ OK ] ACTA DE REUNIÓN: meeting_04x71_acta.pdf',
        '[ OK ] ELEMENTOS DE ACCIÓN: meeting_04x71_tareas.pdf',
        '',
        '> PUBLICANDO ARCHIVOS...',
        '[ OK ] DOCUMENTOS PUBLICADOS EN LA NUBE',
        '[ OK ] SITIO PUBLICADO',
        '',
        'SESIÓN COMPLETA.',
      ],
    },
  },
  scene5: {
    header: {
      en: 'REPORT GENERATED',
      pt: 'RELATÓRIO GERADO',
      es: 'REPORTE GENERADO',
    },
    stats: {
      en: [
        { label: 'TASKS COMPLETED',     value: '3' },
        { label: 'WEBSITES DEPLOYED',   value: '1' },
        { label: 'DOCUMENTS GENERATED', value: '2' },
      ],
      pt: [
        { label: 'TAREFAS CONCLUÍDAS',  value: '3' },
        { label: 'SITES PUBLICADOS',    value: '1' },
        { label: 'DOCUMENTOS GERADOS',  value: '2' },
      ],
      es: [
        { label: 'TAREAS COMPLETADAS',     value: '3' },
        { label: 'SITIOS PUBLICADOS',      value: '1' },
        { label: 'DOCUMENTOS GENERADOS',   value: '2' },
      ],
    },
  },
  scene6: {
    tagline: {
      en: 'THE FUTURE OF MEETINGS',
      pt: 'O FUTURO DAS REUNIÕES',
      es: 'EL FUTURO DE LAS REUNIONES',
    },
  },
} as const;

/** Retorna o valor para o idioma ativo, com fallback para 'en'. */
export function t<T>(map: Record<Lang, T>, lang: Lang): T {
  return map[lang] ?? map.en;
}
