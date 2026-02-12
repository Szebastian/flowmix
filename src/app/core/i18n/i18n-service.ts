import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'es';

export interface I18nString {
  en: string;
  es: string;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly languageSignal = signal<Language>('en');

  language = this.languageSignal.asReadonly();

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const storedLang = localStorage.getItem('language') as Language | null;
    const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
    const initialLang = storedLang || browserLang;
    this.setLanguage(initialLang);
  }

  setLanguage(lang: Language): void {
    this.languageSignal.set(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }

  toggleLanguage(): void {
    const newLang = this.languageSignal() === 'en' ? 'es' : 'en';
    this.setLanguage(newLang);
  }

  translate(i18nString: I18nString): string {
    return i18nString[this.languageSignal()];
  }

  get(key: keyof typeof translations): string {
    const translation = translations[key];
    return translation[this.languageSignal()];
  }
}

export const translations = {
  SYSTEM_STATUS: { en: 'SYSTEM_STATUS: EN_ES_READY', es: 'ESTADO_DEL_SISTEMA: EN_ES_LISTO' },
  NODE_BILINGUAL: { en: 'NODE: BILINGUAL', es: 'NODO: BILINGÜE' },
  FLOWMIX: { en: 'FLOWMIX', es: 'FLOWMIX' },
  ACCESS_CORE: { en: 'ACCESS_CORE', es: 'ACCESO_NÚCLEO' },
  PRIORITY_PROTOCOL_ALPHA: { en: 'PRIORITY PROTOCOL ALPHA', es: 'PROTOCOLO DE PRIORIDAD ALFA' },
  BEYOND_AUDIO_ENGINE: { en: 'BEYOND AUDIO ENGINE', es: 'MÁS ALLÁ DEL MOTOR DE AUDIO' },
  BEYOND: { en: 'BEYOND', es: 'MÁS ALLÁ' },
  AUDIO: { en: 'AUDIO', es: 'AUDIO' },
  ENGINE: { en: 'ENGINE', es: 'MOTOR' },
  HERO_PRECISION: { en: 'PRECISION', es: 'PRECISIÓN' },
  HERO_NEXT_GEN: { en: 'FOR YOUR DJ SET', es: 'PARA TU DJ SET' },
  HERO_FOR_DJ: { en: '', es: '' },
  NEXT_GEN_AUDIO: {
    en: 'Next generation open-source processing. Join the evolution of digital sound design.',
    es: 'Procesamiento de código abierto de próxima generación. Únete a la evolución del diseño de sonido digital.',
  },
  QUEUE: { en: 'QUEUE', es: 'COLA' },
  WAITLIST: { en: 'WAITLIST', es: 'LISTA DE ESPERA' },
  YOUR_POSITION: { en: 'YOUR POSITION', es: 'TU POSICIÓN' },
  SYNCING: { en: 'SYNCING...', es: 'SINCRONIZANDO...' },
  GLOBAL_RANK: { en: 'GLOBAL RANK OUT OF 12,543 PEERS', es: 'RANGO GLOBAL DE 12,543 PARES' },
  SECURE_PRIORITY: { en: 'SECURE PRIORITY ACCESS', es: 'ASEGURA TU ACCESO PRIORITARIO' },
  DJ_NAME: { en: 'DJ NAME', es: 'NOMBRE DJ' },
  EMAIL_ADDRESS: { en: 'EMAIL ADDRESS', es: 'DIRECCIÓN DE CORREO' },
  CLAIM_POSITION: { en: 'CLAIM POSITION', es: 'RECLAMAR POSICIÓN' },
  PROCESSING: { en: 'PROCESSING...', es: 'PROCESANDO...' },
  RANKED_CONTRIBUTORS: { en: 'RANKED CONTRIBUTORS', es: 'COLABORADORES CLASIFICADOS' },
  HALL_OF_FAME: { en: 'HALL OF FAME', es: 'MURO DE LA FAMA' },
  RECOGNIZING_ELITE: { en: 'RECOGNIZING THE CORE ELITE', es: 'RECONOCIENDO A LA ÉLITE' },
  PARTNERS: { en: 'PARTNERS', es: 'SOCIOS' },
  TIER_01: { en: 'Tier 01', es: 'Nivel 01' },
  FOUNDING_DONOR: { en: 'Founding Donor / Donante Fundador', es: 'Donante Fundador / Founding Donor' },
  FEEDBACK_HERO: { en: 'FEEDBACK HERO / HÉROE DEL FEEDBACK', es: 'HÉROE DEL FEEDBACK / FEEDBACK HERO' },
  INSIDERS: { en: 'INSIDERS', es: 'INTERNOS' },
  TIER_02: { en: 'Tier 02', es: 'Nivel 02' },
  BETA_FEEDBACK_SPECIALIST: { en: 'Beta Feedback Specialist / Especialista', es: 'Especialista en Feedback Beta / Beta Feedback Specialist' },
  MEMBERSHIP_TIERS: { en: 'MEMBERSHIP TIERS', es: 'MEMBRESÍAS' },
  LEVEL_01: { en: 'Level 01', es: 'Nivel 01' },
  SUPPORTER: { en: 'Supporter', es: 'Apoyo' },
  JOIN_FOUNDATION: { en: 'JOIN THE FOUNDATION.', es: 'ÚNETE A LA FUNDACIÓN.' },
  UPGRADE_NOW: { en: 'UPGRADE_NOW', es: 'ACTUALIZAR_AHORA' },
  LEVEL_02: { en: 'Level 02', es: 'Nivel 02' },
  INSIDER: { en: 'Insider', es: 'Interno' },
  EARLY_ACCESS_POWER: { en: 'EARLY ACCESS & POWER.', es: 'ACCESO TEMPRANO Y PODER.' },
  LEVEL_03: { en: 'Level 03', es: 'Nivel 03' },
  PARTNER: { en: 'Partner', es: 'Socio' },
  JOIN_NOW: { en: 'JOIN NOW', es: 'UNIRME AHORA' },
  DIRECT_INFLUENCE: { en: 'DIRECT INFLUENCE.', es: 'INFLUENCIA DIRECTA.' },
  SUPPORTER_BENEFITS_TITLE: { en: 'Supporter Benefits', es: 'Beneficios Apoyo' },
  SUPPORTER_B1: { en: 'Community recognition and contribution to open development.', es: 'Reconocimiento comunitario y aporte al desarrollo abierto.' },
  SUPPORTER_B2: { en: 'Participate in feature voting to help set priorities.', es: 'Participa en votaciones de funciones para ayudar a definir prioridades.' },
  SUPPORTER_B3: { en: 'Listed in the Hall of Fame as a supporter.', es: 'Listado en el Muro de la Fama como apoyo.' },
  INSIDER_BENEFITS_TITLE: { en: 'Insider Benefits', es: 'Beneficios Interno' },
  INSIDER_B1: { en: 'Early access to builds and experimental features.', es: 'Acceso temprano a builds y funciones experimentales.' },
  INSIDER_B2: { en: 'Priority feedback channel to influence the roadmap.', es: 'Canal de feedback prioritario para influir en el roadmap.' },
  INSIDER_B3: { en: 'Greater voting power in feature decisions.', es: 'Mayor peso en votaciones de funciones.' },
  PARTNER_BENEFITS_TITLE: { en: 'Partner Benefits', es: 'Beneficios Socio' },
  PARTNER_B1: { en: 'Direct influence on strategic decisions.', es: 'Influencia directa en decisiones estratégicas.' },
  PARTNER_B2: { en: 'Founding Donor and Feedback Hero recognition.', es: 'Reconocimiento como Donante Fundador y Héroe del Feedback.' },
  PARTNER_B3: { en: 'Visibility across community channels and releases.', es: 'Visibilidad en canales comunitarios y lanzamientos.' },
  SOCIAL_PULSE: { en: 'SOCIAL PULSE', es: 'PULSO SOCIAL' },
  REAL_TIME_FEED: { en: 'REAL-TIME FEED', es: 'FEED EN TIEMPO REAL' },
  REAL_TIME_FEEDS: { en: 'Real-time Ecosystem Feeds', es: 'Feeds de Ecosistema en Tiempo Real' },
  LOADING_CONTRIBUTORS: { en: 'LOADING CONTRIBUTORS...', es: 'CARGANDO COLABORADORES...' },
  SYNCING_FEED: { en: 'SYNCING FEED...', es: 'SINCRONIZANDO FEED...' },
  GENDER_PLACEHOLDER: { en: 'Select Gender', es: 'Seleccionar género' },
  GENDER_MALE: { en: 'Male', es: 'Masculino' },
  GENDER_FEMALE: { en: 'Female', es: 'Femenino' },
  GENDER_NOT_SPECIFIED: { en: 'Prefer not to say', es: 'Prefiero no decirlo' },
  CONFIRM_TITLE: { en: 'Email verified', es: 'Correo verificado' },
  CONFIRM_VERIFYING: { en: 'Verifying your link...', es: 'Verificando tu enlace...' },
  CONFIRM_VERIFYING_HINT: { en: 'Please wait while we confirm your access.', es: 'Espera mientras confirmamos tu acceso.' },
  CONFIRM_ERROR: { en: 'Verification error', es: 'Error de verificación' },
  CONFIRM_THANKS: { en: 'Thanks and welcome to the FLOWMIX community!', es: '¡Gracias y bienvenido a la comunidad FLOWMIX!' },
  CONFIRM_WELCOME_TEXT: {
    en: 'Your registration has been confirmed. You will receive updates and early-access invitations.',
    es: 'Tu registro ha sido confirmado. Recibirás actualizaciones e invitaciones de acceso anticipado.'
  },
  GO_HOME: { en: 'Go to Home', es: 'Volver al inicio' },
  CONFIRM_RESEND: { en: 'Resend Link', es: 'Reenviar enlace' },
  CONFIRM_RESENT: { en: 'A new verification email has been sent.', es: 'Se envió un nuevo correo de verificación.' },
  CONFIRM_RESEND_ERROR: { en: 'Unable to resend. Please start again.', es: 'No se pudo reenviar. Inicia nuevamente.' },
  CONFIRM_GO_FEEDBACK: { en: 'Share Your Feedback', es: 'Comparte tu testimonio' },
  FEEDBACK_TITLE: { en: 'DJ FEEDBACK', es: 'FEEDBACK DE DJS' },
  FEEDBACK_SUBTITLE: { en: 'HEAR FROM THE COMMUNITY', es: 'TESTIMONIOS DE LA COMUNIDAD' }
  ,
  FEEDBACK_FORM_TITLE: { en: 'LEAVE YOUR FEEDBACK', es: 'DEJA TU TESTIMONIO' },
  FEEDBACK_FORM_SUBTITLE: { en: 'Share your experience with FLOWMIX', es: 'Comparte tu experiencia con FLOWMIX' },
  FEEDBACK_FORM_EMAIL_LABEL: { en: 'Your Email (registered)', es: 'Tu correo (registrado)' },
  FEEDBACK_FORM_QUOTE_LABEL: { en: 'Your Feedback', es: 'Tu testimonio' },
  FEEDBACK_FORM_QUOTE_PLACEHOLDER: { en: 'Write a short quote...', es: 'Escribe una frase corta...' },
  FEEDBACK_FORM_RATING_LABEL: { en: 'Rating', es: 'Valoración' },
  FEEDBACK_FORM_SUBMIT: { en: 'Send Feedback', es: 'Enviar Testimonio' },
  FEEDBACK_FORM_SUCCESS: { en: 'Thanks! Your feedback has been saved.', es: '¡Gracias! Tu testimonio ha sido guardado.' },
  FEEDBACK_FORM_ERROR: { en: 'Please provide email and feedback.', es: 'Por favor, completa correo y testimonio.' },
  ISSUE_REPORT_TITLE: { en: 'REPORT AN ISSUE', es: 'REPORTA UN PROBLEMA' },
  ISSUE_REPORT_SUBTITLE: { en: 'Help us fix access and installation problems', es: 'Ayúdanos a corregir problemas de acceso e instalación' },
  ISSUE_REPORT_EMAIL_LABEL: { en: 'Your Email', es: 'Tu correo' },
  ISSUE_REPORT_TYPE_LABEL: { en: 'Type of issue', es: 'Tipo de problema' },
  ISSUE_REPORT_TYPE_DEMO: { en: 'Demo won’t open', es: 'La demo no abre' },
  ISSUE_REPORT_TYPE_INSTALLER: { en: 'Windows installer failed', es: 'Falló el instalador de Windows' },
  ISSUE_REPORT_DESCRIPTION_LABEL: { en: 'Describe what happened', es: 'Describe lo ocurrido' },
  ISSUE_REPORT_DESCRIPTION_PLACEHOLDER: { en: 'Steps, error messages, OS version...', es: 'Pasos, mensajes de error, versión de SO...' },
  ISSUE_REPORT_SUBMIT: { en: 'Send Report', es: 'Enviar reporte' },
  ISSUE_REPORT_SUCCESS: { en: 'Thanks! Your report was sent.', es: '¡Gracias! Tu reporte fue enviado.' },
  ISSUE_REPORT_ERROR: { en: 'Please complete email and description.', es: 'Por favor, completa correo y descripción.' },
  FEATURE_REQUESTS_TITLE: { en: 'FEATURE REQUESTS', es: 'FUNCIONES SOLICITADAS' },
  MOST_VOTED_BY_MEMBERSHIP: { en: 'Most voted by membership level', es: 'Funciones más votadas por nivel de membresía' },
  VOTE: { en: 'Vote', es: 'Votar' },
  FEATURE_PROPOSE_TITLE: { en: 'PROPOSE A FEATURE', es: 'PROPONER UNA FUNCIÓN' },
  FEATURE_PROPOSE_SUBTITLE: { en: 'Help decide what comes next', es: 'Ayuda a decidir qué viene después' },
  FEATURE_PROPOSE_EMAIL_LABEL: { en: 'Your Email (optional)', es: 'Tu correo (opcional)' },
  FEATURE_PROPOSE_TITLE_LABEL: { en: 'Feature Title', es: 'Título de la función' },
  FEATURE_PROPOSE_TITLE_PLACEHOLDER: { en: 'e.g., Live Performance Mode', es: 'ej., Modo Performance en vivo' },
  FEATURE_PROPOSE_DESCRIPTION_LABEL: { en: 'Description', es: 'Descripción' },
  FEATURE_PROPOSE_DESCRIPTION_PLACEHOLDER: { en: 'Why this matters, expected behavior...', es: 'Por qué importa, comportamiento esperado...' },
  FEATURE_PROPOSE_SUBMIT: { en: 'Submit Feature', es: 'Enviar función' },
  FEATURE_PROPOSE_SUCCESS: { en: 'Thanks! Your feature was proposed.', es: '¡Gracias! Tu función fue propuesta.' },
  FEATURE_PROPOSE_ERROR: { en: 'Please provide a title.', es: 'Por favor, ingresa un título.' }
  ,
  FEATURE_CATEGORY_LABEL: { en: 'Category', es: 'Categoría' },
  FEATURE_CATEGORY_UX: { en: 'UX', es: 'UX' },
  FEATURE_CATEGORY_AUDIO_ENGINE: { en: 'Audio Engine', es: 'Motor de Audio' },
  FEATURE_CATEGORY_INTEGRATIONS: { en: 'Integrations', es: 'Integraciones' },
  FEATURE_CATEGORY_PERFORMANCE: { en: 'Performance', es: 'Rendimiento' },
  FEATURE_CATEGORY_COMPATIBILITY: { en: 'Compatibility', es: 'Compatibilidad' },
  FEATURE_FILTER_LABEL: { en: 'Filter by category', es: 'Filtrar por categoría' },
  FEATURE_FILTER_ALL: { en: 'All', es: 'Todas' }
  ,
  FEATURE_VOTES_SUMMARY: { en: 'Votes Summary', es: 'Resumen de votos' },
  TOTAL_VOTES: { en: 'Total votes', es: 'Votos totales' }
  ,
  NAV_FEEDBACK: { en: 'Feedback', es: 'Feedback' },
  NAV_ABOUT: { en: 'About Us', es: 'Nosotros' },
  NAV_MEMBERSHIPS: { en: 'Memberships', es: 'Membresías' },
  NAV_HOME: { en: 'Home', es: 'Inicio' },
  PROBLEM_TITLE: { en: 'THE PROBLEM', es: 'EL PROBLEMA' },
  PROBLEM_SUBTITLE: { en: 'CLOSED ECOSYSTEMS', es: 'ECOSISTEMAS CERRADOS' },
  PROBLEM_DESC: { 
    en: 'Traditional DJ software locks your library behind proprietary formats. You don\'t own your metadata, your cues, or your playlists. They force you into a cycle of paid upgrades without listening to your needs.', 
    es: 'El software de DJ tradicional encierra tu librería tras formatos propietarios. No eres dueño de tu metadata, tus cues o tus playlists. Te fuerzan a un ciclo de actualizaciones pagas sin escuchar tus necesidades.' 
  },
  SOLUTION_TITLE: { en: 'THE SOLUTION', es: 'LA SOLUCIÓN' },
  SOLUTION_SUBTITLE: { en: 'OPEN FREEDOM', es: 'LIBERTAD ABIERTA' },
  SOLUTION_DESC: { 
    en: 'FlowMix breaks the chains. An open-source platform where your data is yours forever. Community-driven development means features you actually want, with total transparency and zero vendor lock-in.', 
    es: 'FlowMix rompe las cadenas. Una plataforma de código abierto donde tus datos son tuyos para siempre. Desarrollo impulsado por la comunidad significa funciones que realmente quieres, con transparencia total y sin ataduras.' 
  },
  NOSOTROS_TITLE: { en: 'ABOUT US', es: 'NOSOTROS' },
  EVOL_CABINA_TITLE: { en: 'EVOLUTION OF THE BOOTH', es: 'LA EVOLUCIÓN DE LA CABINA' },
  NOS_P1: {
    en: 'FlowMix was not born in an office—it was born in the booth. As DJs, we know the difference between a mediocre set and a legendary one is control. For years, DJs have been held hostage by closed ecosystems that limit creativity and fragment our music.',
    es: 'FlowMix no nació en una oficina, nació en la cabina. Como DJs, sabemos que la diferencia entre un set mediocre y uno legendario está en el control. Durante años, los DJs hemos sido rehenes de ecosistemas cerrados que limitan nuestra creatividad y fragmentan nuestra música.'
  },
  NOS_P2: {
    en: 'FlowMix emerges to break those barriers. We are an open-source project dedicated to returning absolute ownership of the music library to the artist. We are not just a tool; we are the core of your workflow.',
    es: 'FlowMix surge para romper esas barreras. Somos un proyecto de código abierto dedicado a devolverle al artista la propiedad absoluta sobre su biblioteca musical. No somos solo una herramienta; somos el núcleo de tu flujo de trabajo.'
  },
  MANIFIESTO_TITLE: { en: 'OUR PHILOSOPHY: THE FLOWMIX MANIFESTO', es: 'NUESTRA FILOSOFÍA: EL MANIFIESTO FLOWMIX' },
  MAN_LIBERTAD: {
    en: 'Digital Freedom: Your Cue Points, Grids, and Playlists belong to you. FlowMix bridges platforms so you never lose your prior work.',
    es: 'Libertad Digital: Creemos que tus Cue Points, tus Grids y tus Playlists te pertenecen. FlowMix es el puente que te permite moverte entre plataformas sin perder ni un segundo de tu trabajo previo.'
  },
  MAN_TRANSPARENCIA: {
    en: 'Full Transparency: As free software, our code is your code. No hidden analysis algorithms and no invasive telemetry. You control what happens under the hood.',
    es: 'Transparencia Total: Al ser software libre, nuestro código es tu código. Sin algoritmos de análisis ocultos ni telemetría invasiva. Tú tienes el control de lo que sucede bajo el capó.'
  },
  MAN_RENDIMIENTO: {
    en: 'Professional Performance: Live has no room for error. We built a high-performance engine optimized to handle massive libraries at zero latency.',
    es: 'Rendimiento Profesional: Entendemos que en vivo no hay margen de error. Por ello, desarrollamos un motor de alto rendimiento optimizado para manejar librerías masivas con latencia cero.'
  },
  MAN_EVOLUCION: {
    en: 'Community Evolution: We don’t follow market rules—we follow booth needs. FlowMix grows with real feedback from a global community seeking smarter, open tools.',
    es: 'Evolución Comunitaria: No seguimos las reglas del mercado, seguimos las necesidades de la cabina. FlowMix crece gracias al feedback real de una comunidad global que busca una herramienta más inteligente y abierta.'
  },
  SURVIVE_TITLE: { en: 'HOW DOES FLOWMIX SURVIVE?', es: '¿CÓMO SOBREVIVE FLOWMIX?' },
  SURVIVE_P1: {
    en: 'Unlike traditional platforms, FlowMix has no corporate investors dictating our path. FlowMix survives and evolves thanks solely to user support. We chose a community-sustainability model through memberships because we want the software to be accountable only to the DJs who use it.',
    es: 'A diferencia de las plataformas tradicionales, FlowMix no tiene inversores corporativos que dicten nuestro camino. FlowMix sobrevive y evoluciona únicamente gracias al apoyo de sus usuarios. Hemos elegido un modelo de sostenibilidad comunitaria a través de membresías porque queremos que el software rinda cuentas solo ante los DJs que lo usan.'
  },
  SURVIVE_P2: {
    en: 'By joining with a membership, you become the engine of the project. Your direct support funds:',
    es: 'Al unirte a través de una membresía, te conviertes en el motor del proyecto. Tu apoyo directo financia:'
  },
  SURVIVE_LIST_ONE: {
    en: 'Independent Development: Keep the code free from advertising and third-party interests.',
    es: 'Desarrollo Independiente: Mantener el código libre de publicidad y de intereses de terceros.'
  },
  SURVIVE_LIST_TWO: {
    en: 'Infrastructure & Sync: High-speed servers for secure, global data management.',
    es: 'Infraestructura y Sincronización: Servidores de alta velocidad para que la gestión de tus datos sea segura y global.'
  },
  SURVIVE_LIST_THREE: {
    en: 'Continuous Innovation: Engineering hours focused on optimization for the latest Windows, macOS, and Linux versions.',
    es: 'Innovación Continua: Horas de ingeniería dedicadas a optimizar el software para las últimas versiones de Windows, macOS y Linux.'
  },
  INFLUENCIA_TITLE: { en: 'YOUR SUPPORT, YOUR INFLUENCE', es: 'TU APOYO, TU INFLUENCIA' },
  INFLUENCIA_P1: {
    en: 'When you choose a membership level—Supporter, Insider, or Partner—you stop being a passive user and become a pillar of the project. You enable us to keep building a tool that adapts to the DJ, not the other way around.',
    es: 'Cuando eliges un nivel de membresía —Apoyo, Interno o Socio— dejas de ser un usuario pasivo para convertirte en un pilar del proyecto. Nos permites seguir construyendo una herramienta que se adapta al DJ, y no al revés.'
  },
  INFLUENCIA_P2: {
    en: 'FlowMix is free software, but its evolution requires energy. Join today and help us keep the booth open for everyone.',
    es: 'FlowMix es software libre, pero su evolución requiere energía. Únete hoy y ayúdanos a mantener la cabina abierta para todos.'
  }
} as const;
