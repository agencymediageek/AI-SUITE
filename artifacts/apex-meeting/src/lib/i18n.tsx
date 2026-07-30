import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

const translations: Translations = {
  // ── Navbar ──────────────────────────────────────────────────────────────────
  'nav.home':         { pt: 'Início',         en: 'Home',       es: 'Inicio' },
  'nav.dashboard':    { pt: 'Painel',         en: 'Dashboard',  es: 'Panel' },
  'nav.meetings':     { pt: 'Reuniões',       en: 'Meetings',   es: 'Reuniones' },
  'nav.pricing':      { pt: 'Planos',         en: 'Pricing',    es: 'Precios' },
  'nav.settings':     { pt: 'Configurações',  en: 'Settings',   es: 'Configuración' },
  'nav.admin':        { pt: 'Admin',          en: 'Admin',      es: 'Admin' },
  'nav.logout':       { pt: 'Sair',           en: 'Logout',     es: 'Salir' },
  'nav.login':        { pt: 'Entrar',         en: 'Login',      es: 'Entrar' },
  'nav.register':     { pt: 'Começar agora',  en: 'Get Started', es: 'Empezar' },
  'nav.comoFunciona': { pt: 'Como Funciona',  en: 'How It Works', es: 'Cómo Funciona' },
  'nav.recursos':     { pt: 'Recursos',       en: 'Features',   es: 'Recursos' },
  'nav.planos':       { pt: 'Planos',         en: 'Pricing',    es: 'Planes' },
  'nav.faq':          { pt: 'FAQ',            en: 'FAQ',        es: 'FAQ' },
  'nav.contato':      { pt: 'Contato',        en: 'Contact',    es: 'Contacto' },
  'nav.sobre':        { pt: 'Sobre',          en: 'About',      es: 'Sobre' },
  'nav.casos':        { pt: 'Casos',          en: 'Cases',      es: 'Casos' },
  'nav.inicio':       { pt: 'Início',         en: 'Home',       es: 'Inicio' },

  // ── Hero ────────────────────────────────────────────────────────────────────
  'hero.title':    { pt: 'IA que executa enquanto você fala', en: 'AI that executes while you speak', es: 'IA que ejecuta mientras hablas' },
  'hero.subtitle': { pt: 'APEX CORE não apenas assiste reuniões — ele constrói sites, publica documentos e configura infraestrutura antes da reunião terminar.', en: "APEX CORE doesn't just attend meetings — it builds websites, publishes documents, and configures infrastructure before the meeting ends.", es: 'APEX CORE no solo asiste a reuniones — construye sitios web, publica documentos y configura infraestructura antes de que termine la reunión.' },
  'hero.cta':      { pt: 'Começar agora',  en: 'Get started',   es: 'Comenzar ahora' },
  'hero.demo':     { pt: 'Ver demo →',     en: 'Watch demo →',  es: 'Ver demo →' },

  // ── Landing — badges & section headings ────────────────────────────────────
  'landing.badge':             { pt: 'ENTERPRISE AI INTELLIGENCE', en: 'ENTERPRISE AI INTELLIGENCE', es: 'ENTERPRISE AI INTELLIGENCE' },
  'landing.trust.noContract':  { pt: 'Sem fidelidade',   en: 'No contract',      es: 'Sin fidelidad' },
  'landing.trust.cloud':       { pt: '100% em nuvem',    en: '100% cloud',        es: '100% en la nube' },
  'landing.trust.setup':       { pt: 'Setup em 3 min',   en: '3-min setup',       es: 'Instalación 3 min' },
  'landing.how.badge':         { pt: 'COMO FUNCIONA',    en: 'HOW IT WORKS',      es: 'CÓMO FUNCIONA' },
  'landing.how.title':         { pt: 'Da reunião ao mundo real em', en: 'From meeting to real world in', es: 'De la reunión al mundo real en' },
  'landing.how.title2':        { pt: '3 passos',         en: '3 steps',           es: '3 pasos' },
  'landing.features.badge':    { pt: 'RECURSOS',         en: 'FEATURES',          es: 'RECURSOS' },
  'landing.features.title':    { pt: 'Superpoderes para o', en: 'Superpowers for the', es: 'Superpoderes para el' },
  'landing.features.title2':   { pt: 'C-Suite',          en: 'C-Suite',           es: 'C-Suite' },
  'landing.features.subtitle': { pt: 'Execute na velocidade do pensamento', en: 'Execute at the speed of thought', es: 'Ejecuta a la velocidad del pensamiento' },
  'landing.cases.title':       { pt: 'Feito para',       en: 'Built for',         es: 'Hecho para' },
  'landing.cases.title2':      { pt: 'Momentos de Decisão', en: 'Decision Moments', es: 'Momentos de Decisión' },
  'landing.cases.subtitle':    { pt: 'Onde decisões se transformam em realidade instantaneamente', en: 'Where decisions become reality instantly', es: 'Donde las decisiones se convierten en realidad al instante' },
  'landing.plans.badge':       { pt: 'PLANOS',           en: 'PLANS',             es: 'PLANES' },
  'landing.plans.title':       { pt: 'Escolha seu',      en: 'Choose your',       es: 'Elige tu' },
  'landing.plans.title2':      { pt: 'plano',            en: 'plan',              es: 'plan' },
  'landing.plans.popular':     { pt: 'Mais Popular',     en: 'Most Popular',      es: 'Más Popular' },
  'landing.cta.badge':         { pt: 'COMECE AGORA',     en: 'GET STARTED',       es: 'EMPIEZA AHORA' },
  'landing.cta.title':         { pt: 'Pronto para executar na', en: 'Ready to execute at', es: 'Listo para ejecutar a' },
  'landing.cta.title2':        { pt: 'velocidade do pensamento?', en: 'the speed of thought?', es: 'la velocidad del pensamiento?' },
  'landing.cta.subtitle':      { pt: 'Junte-se a empresas que já operam com o APEX CORE. Setup em 3 minutos, sem cartão.', en: 'Join companies already operating with APEX CORE. 3-minute setup, no card required.', es: 'Únete a las empresas que ya operan con APEX CORE. Instalación en 3 minutos, sin tarjeta.' },
  'landing.cta.action':        { pt: 'Criar conta grátis', en: 'Create free account', es: 'Crear cuenta gratis' },
  'landing.cta.secondary':     { pt: 'Ver demonstração', en: 'Watch demo',        es: 'Ver demostración' },
  'landing.faq.title':         { pt: 'Perguntas',        en: 'Frequently',        es: 'Preguntas' },
  'landing.faq.title2':        { pt: 'frequentes',       en: 'asked questions',   es: 'frecuentes' },
  'landing.faq.more':          { pt: 'Ver todas as perguntas →', en: 'See all questions →', es: 'Ver todas las preguntas →' },

  // ── Stats bar ───────────────────────────────────────────────────────────────
  'stats.setup':        { pt: 'de setup',      en: 'to set up',       es: 'de configuración' },
  'stats.available':    { pt: 'disponível',    en: 'available',       es: 'disponible' },
  'stats.execution':    { pt: 'execução',      en: 'execution',       es: 'ejecución' },
  'stats.possibilities':{ pt: 'possibilidades', en: 'possibilities',  es: 'posibilidades' },

  // ── Footer ──────────────────────────────────────────────────────────────────
  'footer.product':   { pt: 'Produto',    en: 'Product',   es: 'Producto' },
  'footer.company':   { pt: 'Empresa',    en: 'Company',   es: 'Empresa' },
  'footer.legal':     { pt: 'Legal',      en: 'Legal',     es: 'Legal' },
  'footer.support':   { pt: 'Suporte',    en: 'Support',   es: 'Soporte' },
  'footer.terms':     { pt: 'Termos de Uso',   en: 'Terms of Use', es: 'Términos de Uso' },
  'footer.privacy':   { pt: 'Privacidade',     en: 'Privacy',      es: 'Privacidad' },
  'footer.lgpd':      { pt: 'LGPD',           en: 'LGPD',         es: 'LGPD' },
  'footer.help':      { pt: 'Central de Ajuda', en: 'Help Center', es: 'Centro de Ayuda' },
  'footer.sales':     { pt: 'Falar com vendas', en: 'Talk to sales', es: 'Hablar con ventas' },
  'footer.resources': { pt: 'Recursos',    en: 'Features',  es: 'Recursos' },
  'footer.pricing':   { pt: 'Preços',      en: 'Pricing',   es: 'Precios' },
  'footer.howWorks':  { pt: 'Como Funciona', en: 'How It Works', es: 'Cómo Funciona' },
  'footer.about':     { pt: 'Sobre',       en: 'About',     es: 'Sobre' },
  'footer.copyright': { pt: '© 2026 APEX CORE MEETING. Powered by TechSites AI.', en: '© 2026 APEX CORE MEETING. Powered by TechSites AI.', es: '© 2026 APEX CORE MEETING. Powered by TechSites AI.' },

  // ── Login ───────────────────────────────────────────────────────────────────
  'login.title':          { pt: 'Acesse APEX CORE',  en: 'Access APEX CORE',   es: 'Acceda a APEX CORE' },
  'login.subtitle':       { pt: 'Digite suas credenciais para continuar', en: 'Enter your credentials to continue', es: 'Ingresa tus credenciales para continuar' },
  'login.email':          { pt: 'Email',              en: 'Email',              es: 'Correo electrónico' },
  'login.password':       { pt: 'Senha',              en: 'Password',           es: 'Contraseña' },
  'login.submit':         { pt: 'Entrar',             en: 'Login',              es: 'Entrar' },
  'login.loading':        { pt: 'Autenticando...',    en: 'Authenticating...',  es: 'Autenticando...' },
  'login.noAccount':      { pt: 'Não tem conta?',     en: 'No account?',        es: '¿No tienes cuenta?' },
  'login.signUp':         { pt: 'Criar agora',        en: 'Create now',         es: 'Crear ahora' },
  'login.success.title':  { pt: 'Acesso concedido',   en: 'Access granted',     es: 'Acceso concedido' },
  'login.success.desc':   { pt: 'Bem-vindo de volta ao APEX CORE', en: 'Welcome back to APEX CORE', es: 'Bienvenido de vuelta a APEX CORE' },
  'login.error.title':    { pt: 'Acesso negado',      en: 'Access denied',      es: 'Acceso denegado' },
  'login.error.default':  { pt: 'Falha na autenticação', en: 'Authentication failed', es: 'Falló la autenticación' },
  'login.demo':           { pt: 'Conta demo disponível', en: 'Demo account available', es: 'Cuenta demo disponible' },

  // ── Register ────────────────────────────────────────────────────────────────
  'register.title':         { pt: 'Criar Conta APEX CORE', en: 'Create APEX CORE Account', es: 'Crear Cuenta APEX CORE' },
  'register.subtitle':      { pt: 'Junte-se ao centro de comando executivo', en: 'Join the executive command center', es: 'Únete al centro de comando ejecutivo' },
  'register.name':          { pt: 'Nome completo',      en: 'Full name',          es: 'Nombre completo' },
  'register.email':         { pt: 'Email',              en: 'Email',              es: 'Correo electrónico' },
  'register.password':      { pt: 'Senha',              en: 'Password',           es: 'Contraseña' },
  'register.submit':        { pt: 'Criar Conta',        en: 'Create Account',     es: 'Crear Cuenta' },
  'register.loading':       { pt: 'Criando conta...',   en: 'Creating account...', es: 'Creando cuenta...' },
  'register.hasAccount':    { pt: 'Já tem conta?',      en: 'Already have an account?', es: '¿Ya tienes cuenta?' },
  'register.signIn':        { pt: 'Entrar',             en: 'Sign in',            es: 'Entrar' },
  'register.success.title': { pt: 'Conta criada',       en: 'Account created',    es: 'Cuenta creada' },
  'register.success.desc':  { pt: 'Bem-vindo ao APEX CORE', en: 'Welcome to APEX CORE', es: 'Bienvenido a APEX CORE' },
  'register.error.title':   { pt: 'Falha no registro',  en: 'Registration failed', es: 'Registro fallido' },
  'register.error.default': { pt: 'Falha ao criar conta', en: 'Registration failed', es: 'Error al crear cuenta' },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  'dashboard.title':        { pt: 'Centro de Comando',  en: 'Command Center',    es: 'Centro de Comando' },
  'dashboard.subtitle':     { pt: 'Gerencie suas reuniões com IA', en: 'Manage your AI-powered meetings', es: 'Gestiona tus reuniones con IA' },
  'dashboard.newMeeting':   { pt: 'Nova Reunião',       en: 'New Meeting',       es: 'Nueva Reunión' },
  'dashboard.meetings':     { pt: 'Suas Reuniões',      en: 'Your Meetings',     es: 'Tus Reuniones' },
  'dashboard.overview':     { pt: 'Visão Geral',        en: 'Overview',          es: 'Resumen' },
  'dashboard.totalMeetings':{ pt: 'Total de Reuniões',  en: 'Total Meetings',    es: 'Reuniones Totales' },
  'dashboard.totalSessions':{ pt: 'Sessões Realizadas', en: 'Sessions Completed', es: 'Sesiones Completadas' },
  'dashboard.activeSessions':{ pt: 'Sessões Ativas',    en: 'Active Sessions',   es: 'Sesiones Activas' },
  'dashboard.avgDuration':  { pt: 'Duração Média',      en: 'Avg Duration',      es: 'Duración Media' },
  'dashboard.noMeetings':   { pt: 'Nenhuma reunião ainda', en: 'No meetings yet', es: 'Aún no hay reuniones' },
  'dashboard.createFirst':  { pt: 'Crie sua primeira sala de reunião com IA', en: 'Create your first AI meeting room', es: 'Crea tu primera sala de reunión con IA' },

  // ── Meeting ──────────────────────────────────────────────────────────────────
  'meeting.startSession':   { pt: 'Iniciar Sessão',  en: 'Start Session',  es: 'Iniciar Sesión' },
  'meeting.endSession':     { pt: 'Encerrar Sessão', en: 'End Session',    es: 'Finalizar Sesión' },
  'meeting.configure':      { pt: 'Configurar',      en: 'Configure',      es: 'Configurar' },
  'meeting.delete':         { pt: 'Excluir',         en: 'Delete',         es: 'Eliminar' },
  'meeting.sessions':       { pt: 'Sessões',         en: 'Sessions',       es: 'Sesiones' },
  'meeting.listening':      { pt: 'Ouvindo...',      en: 'Listening...',   es: 'Escuchando...' },
  'meeting.processing':     { pt: 'Processando...',  en: 'Processing...',  es: 'Procesando...' },
  'meeting.speak':          { pt: 'Fale um comando', en: 'Speak a command', es: 'Di un comando' },

  // ── Pricing ──────────────────────────────────────────────────────────────────
  'pricing.title':     { pt: 'Escolha seu Plano',      en: 'Choose Your Plan',         es: 'Elige tu Plan' },
  'pricing.subtitle':  { pt: 'Escale suas reuniões IA conforme suas necessidades', en: 'Scale your AI-powered meetings to your needs', es: 'Escala tus reuniones IA según tus necesidades' },
  'pricing.popular':   { pt: 'Mais Popular',            en: 'Most Popular',             es: 'Más Popular' },
  'pricing.mo':        { pt: 'mês',                     en: 'mo',                       es: 'mes' },
  'pricing.yr':        { pt: 'ano',                     en: 'yr',                       es: 'año' },
  'pricing.lifetime':  { pt: 'vitalício',               en: 'lifetime',                 es: 'de por vida' },
  'pricing.tokens':    { pt: 'tokens',                  en: 'tokens',                   es: 'tokens' },
  'pricing.choose':    { pt: 'Escolher',                en: 'Choose',                   es: 'Elegir' },
  'pricing.note':      { pt: 'Todos os planos incluem suporte por voz, câmera e terminal ao vivo.', en: 'All plans include voice, camera support, and live terminal.', es: 'Todos los planes incluyen voz, cámara y terminal en vivo.' },
  'pricing.noPlans':   { pt: 'Nenhum plano disponível no momento', en: 'No plans available at the moment', es: 'No hay planes disponibles en este momento' },
  'pricing.loading':   { pt: 'Carregando planos...', en: 'Loading plans...', es: 'Cargando planes...' },

  // ── Admin ────────────────────────────────────────────────────────────────────
  'admin.title':        { pt: 'Painel Admin',        en: 'Admin Dashboard',    es: 'Panel Admin' },
  'admin.subtitle':     { pt: 'Visão geral e gestão de usuários', en: 'Platform overview and user management', es: 'Resumen de plataforma y gestión de usuarios' },
  'admin.totalUsers':   { pt: 'Total de Usuários',  en: 'Total Users',        es: 'Usuarios Totales' },
  'admin.generations':  { pt: 'Gerações',           en: 'Generations',        es: 'Generaciones' },
  'admin.activeToday':  { pt: 'Ativos Hoje',        en: 'Active Today',       es: 'Activos Hoy' },
  'admin.revenue':      { pt: 'Receita',            en: 'Revenue',            es: 'Ingresos' },
  'admin.users':        { pt: 'Usuários',           en: 'Users',              es: 'Usuarios' },
  'admin.name':         { pt: 'Nome',               en: 'Name',               es: 'Nombre' },
  'admin.email':        { pt: 'Email',              en: 'Email',              es: 'Correo' },
  'admin.role':         { pt: 'Função',             en: 'Role',               es: 'Rol' },
  'admin.plan':         { pt: 'Plano',              en: 'Plan',               es: 'Plan' },
  'admin.tokens':       { pt: 'Tokens',             en: 'Tokens',             es: 'Tokens' },
  'admin.noUsers':      { pt: 'Nenhum usuário encontrado', en: 'No users found', es: 'No se encontraron usuarios' },
  'admin.free':         { pt: 'Grátis',             en: 'Free',               es: 'Gratis' },

  // ── Settings ─────────────────────────────────────────────────────────────────
  'settings.title':       { pt: 'Configurações',     en: 'Settings',          es: 'Configuración' },
  'settings.subtitle':    { pt: 'Personalize sua experiência APEX CORE', en: 'Customize your APEX CORE experience', es: 'Personaliza tu experiencia APEX CORE' },
  'settings.whiteLabel':  { pt: 'White Label',       en: 'White Label',       es: 'Marca Blanca' },
  'settings.aiName':      { pt: 'Nome da IA',        en: 'AI Name',           es: 'Nombre de la IA' },
  'settings.save':        { pt: 'Salvar',            en: 'Save',              es: 'Guardar' },
  'settings.saved':       { pt: 'Configurações salvas', en: 'Settings saved', es: 'Configuración guardada' },
  'settings.error':       { pt: 'Erro ao salvar',    en: 'Error saving',      es: 'Error al guardar' },
  'settings.logoUrl':     { pt: 'URL do Logo',       en: 'Logo URL',          es: 'URL del Logo' },
  'settings.primaryColor':{ pt: 'Cor Primária',      en: 'Primary Color',     es: 'Color Primario' },
  'settings.accentColor': { pt: 'Cor de Destaque',   en: 'Accent Color',      es: 'Color de Acento' },
  'settings.companyName': { pt: 'Nome da Empresa',   en: 'Company Name',      es: 'Nombre de la Empresa' },
  'settings.subdomain':   { pt: 'Subdomínio',        en: 'Subdomain',         es: 'Subdominio' },

  // ── Sobre (About) ─────────────────────────────────────────────────────────────
  'sobre.badge':       { pt: 'Sobre o APEX CORE',      en: 'About APEX CORE',   es: 'Sobre APEX CORE' },
  'sobre.title1':      { pt: 'Construímos a IA que',   en: 'We built the AI that', es: 'Construimos la IA que' },
  'sobre.title2':      { pt: 'faz acontecer',          en: 'makes it happen',    es: 'hace que suceda' },
  'sobre.subtitle':    { pt: 'O APEX CORE nasceu para transformar reuniões em entregas concretas. Não mais promessas — apenas execução.', en: 'APEX CORE was born to transform meetings into concrete deliverables. No more promises — just execution.', es: 'APEX CORE nació para transformar reuniones en entregas concretas. No más promesas — solo ejecución.' },
  'sobre.story.title': { pt: 'Nossa', en: 'Our', es: 'Nuestra' },
  'sobre.story.title2':{ pt: 'história', en: 'story', es: 'historia' },
  'sobre.story.p1':    { pt: '<strong>Nascemos da frustração de executivos</strong> que saíam de reuniões com listas mas sem entregas. Toda semana, as mesmas promessas: "vamos colocar em produção essa semana", "o site está pronto na sexta", "o documento será enviado hoje."', en: '<strong>We were born from the frustration of executives</strong> who left meetings with lists but no deliverables. Every week, the same promises: "we\'ll push to production this week", "the site is ready Friday", "the document will be sent today."', es: '<strong>Nacimos de la frustración de los ejecutivos</strong> que salían de reuniones con listas pero sin entregas. Cada semana, las mismas promesas: "lo subimos a producción esta semana", "el sitio estará listo el viernes", "el documento se enviará hoy."' },
  'sobre.story.p2':    { pt: 'Percebemos que o problema não era a vontade das pessoas — era a ausência de um agente capaz de transformar intenção em ação imediata. Assim surgiu o APEX CORE MEETING.', en: 'We realized the problem wasn\'t people\'s willingness — it was the absence of an agent capable of turning intention into immediate action. That\'s how APEX CORE MEETING was born.', es: 'Nos dimos cuenta de que el problema no era la voluntad de las personas — era la ausencia de un agente capaz de convertir la intención en acción inmediata. Así nació APEX CORE MEETING.' },
  'sobre.story.p3':    { pt: 'Uma plataforma onde a IA não apenas assiste suas reuniões, mas <strong>executa enquanto você fala</strong>. Deploy de sites, configuração de DNS, publicação de documentos — tudo acontece antes da reunião terminar.', en: 'A platform where AI doesn\'t just attend your meetings, it <strong>executes while you speak</strong>. Site deploys, DNS configuration, document publishing — all before the meeting ends.', es: 'Una plataforma donde la IA no solo asiste a tus reuniones, sino que <strong>ejecuta mientras hablas</strong>. Despliegue de sitios, configuración de DNS, publicación de documentos — todo antes de que termine la reunión.' },
  'sobre.story.p4':    { pt: 'Hoje, equipes de C-Suite ao redor do Brasil usam o APEX CORE para operar na velocidade das máquinas. Sem fidelidade, sem complexidade — só entrega.', en: 'Today, C-Suite teams across Brazil use APEX CORE to operate at machine speed. No contracts, no complexity — just delivery.', es: 'Hoy, equipos de C-Suite en todo Brasil usan APEX CORE para operar a la velocidad de las máquinas. Sin contratos, sin complejidad — solo entrega.' },
  'sobre.values.title':{ pt: 'Nossos', en: 'Our', es: 'Nuestros' },
  'sobre.values.title2':{ pt: 'valores', en: 'values', es: 'valores' },
  'sobre.mission.title':{ pt: 'Nossa', en: 'Our', es: 'Nuestra' },
  'sobre.mission.title2':{ pt: 'missão', en: 'mission', es: 'misión' },
  'sobre.mission.text':{ pt: 'Tornar cada reunião executiva uma máquina de entrega. Zero burocracia, zero espera — apenas resultados reais antes da chamada terminar.', en: 'Make every executive meeting a delivery machine. Zero bureaucracy, zero waiting — just real results before the call ends.', es: 'Hacer de cada reunión ejecutiva una máquina de entrega. Cero burocracia, cero espera — solo resultados reales antes de que termine la llamada.' },
  'sobre.mission.cta':  { pt: 'Começar agora', en: 'Get started now', es: 'Comenzar ahora' },
  'sobre.values.v1.title':{ pt: 'Execução acima de tudo', en: 'Execution above all', es: 'Ejecución ante todo' },
  'sobre.values.v1.desc':{ pt: 'Não acreditamos em reuniões que geram apenas listas de tarefas. Cada sessão com o APEX CORE deve terminar com entregas reais no mundo.', en: 'We don\'t believe in meetings that only generate task lists. Every APEX CORE session must end with real-world deliverables.', es: 'No creemos en reuniones que solo generan listas de tareas. Cada sesión de APEX CORE debe terminar con entregas reales.' },
  'sobre.values.v2.title':{ pt: 'Segurança como fundamento', en: 'Security as foundation', es: 'Seguridad como fundamento' },
  'sobre.values.v2.desc':{ pt: 'Construímos com criptografia end-to-end desde o primeiro dia. Seus dados de reunião nunca são usados para treinar modelos externos.', en: 'We build with end-to-end encryption from day one. Your meeting data is never used to train external models.', es: 'Construimos con cifrado de extremo a extremo desde el primer día. Sus datos de reunión nunca se usan para entrenar modelos externos.' },
  'sobre.values.v3.title':{ pt: 'Acessível para qualquer empresa', en: 'Accessible to any company', es: 'Accesible para cualquier empresa' },
  'sobre.values.v3.desc':{ pt: 'Do founder solo ao C-Suite de uma multinacional. O APEX CORE escala com você sem complexidade desnecessária.', en: 'From solo founders to multinational C-Suites. APEX CORE scales with you without unnecessary complexity.', es: 'Desde fundadores independientes hasta el C-Suite de una multinacional. APEX CORE escala contigo sin complejidad innecesaria.' },
  'sobre.mission.pills': { pt: 'Entrega > Promessa,IA como parceira de negócio,Confiança por transparência', en: 'Delivery > Promise,AI as a business partner,Trust through transparency', es: 'Entrega > Promesa,IA como socia de negocio,Confianza por transparencia' },

  // ── Contato (Contact) ─────────────────────────────────────────────────────────
  'contato.badge':        { pt: 'Contato',      en: 'Contact',     es: 'Contacto' },
  'contato.title1':       { pt: 'Fale com a',   en: 'Talk to our', es: 'Habla con el' },
  'contato.title2':       { pt: 'equipe',        en: 'team',        es: 'equipo' },
  'contato.subtitle':     { pt: 'Responderemos em até 24h úteis. Para vendas e parcerias, geralmente respondemos mais rápido.', en: 'We respond within 24 business hours. For sales and partnerships, we usually reply faster.', es: 'Respondemos en hasta 24 horas hábiles. Para ventas y asociaciones, generalmente respondemos más rápido.' },
  'contato.name':         { pt: 'Nome completo',  en: 'Full name',   es: 'Nombre completo' },
  'contato.email':        { pt: 'Email',           en: 'Email',       es: 'Correo electrónico' },
  'contato.topic':        { pt: 'Assunto',          en: 'Subject',     es: 'Asunto' },
  'contato.topicDefault': { pt: 'Selecione um assunto', en: 'Select a subject', es: 'Selecciona un asunto' },
  'contato.topic.support':{ pt: 'Suporte técnico', en: 'Technical support', es: 'Soporte técnico' },
  'contato.topic.sales':  { pt: 'Vendas / Planos', en: 'Sales / Plans', es: 'Ventas / Planes' },
  'contato.topic.partner':{ pt: 'Parceria',         en: 'Partnership',  es: 'Asociación' },
  'contato.message':      { pt: 'Mensagem',          en: 'Message',      es: 'Mensaje' },
  'contato.messagePlaceholder': { pt: 'Descreva sua dúvida ou necessidade...', en: 'Describe your question or need...', es: 'Describe tu pregunta o necesidad...' },
  'contato.send':         { pt: 'Enviar mensagem',  en: 'Send message',  es: 'Enviar mensaje' },
  'contato.sending':      { pt: 'Enviando...',       en: 'Sending...',    es: 'Enviando...' },
  'contato.orWrite':      { pt: 'Ou escreva diretamente para', en: 'Or write directly to', es: 'O escribe directamente a' },
  'contato.success.title':{ pt: 'Mensagem enviada!', en: 'Message sent!', es: '¡Mensaje enviado!' },
  'contato.success.text': { pt: 'Recebemos sua mensagem. Retornaremos em breve pelo email', en: 'We received your message. We\'ll get back to you at', es: 'Recibimos tu mensaje. Te responderemos en' },
  'contato.success.urgent':{ pt: 'Em caso de urgência:', en: 'For urgent matters:', es: 'Para asuntos urgentes:' },

  // ── FAQ ───────────────────────────────────────────────────────────────────────
  'faq.badge':        { pt: 'FAQ',                    en: 'FAQ',                      es: 'FAQ' },
  'faq.title1':       { pt: 'Perguntas',              en: 'Frequently',               es: 'Preguntas' },
  'faq.title2':       { pt: 'frequentes',             en: 'asked questions',          es: 'frecuentes' },
  'faq.subtitle':     { pt: 'Tudo o que você precisa saber sobre o APEX CORE MEETING.', en: 'Everything you need to know about APEX CORE MEETING.', es: 'Todo lo que necesitas saber sobre APEX CORE MEETING.' },
  'faq.stillDoubt':   { pt: 'Ainda tem dúvidas?',     en: 'Still have questions?',    es: '¿Todavía tienes dudas?' },
  'faq.ctaText':      { pt: 'Nossa equipe está pronta para ajudar. Entre em contato diretamente.', en: 'Our team is ready to help. Get in touch directly.', es: 'Nuestro equipo está listo para ayudar. Contáctanos directamente.' },
  'faq.cta.talk':     { pt: 'Falar com a equipe',     en: 'Talk to the team',         es: 'Hablar con el equipo' },
  'faq.cat.general':  { pt: 'Geral',                  en: 'General',                  es: 'General' },
  'faq.cat.tech':     { pt: 'Tecnologia',             en: 'Technology',               es: 'Tecnología' },
  'faq.cat.plans':    { pt: 'Planos e Pagamento',     en: 'Plans & Payment',          es: 'Planes y Pago' },
  'faq.cat.security': { pt: 'Segurança',              en: 'Security',                 es: 'Seguridad' },
};

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('apex_language');
    return (stored as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('apex_language', language);
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
