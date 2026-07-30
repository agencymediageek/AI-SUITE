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

  // ── Landing — content arrays ─────────────────────────────────────────────────
  'landing.footer.brand': { pt: 'IA que executa enquanto você fala. Enterprise AI para C-Suite.', en: 'AI that executes while you speak. Enterprise AI for C-Suite.', es: 'IA que ejecuta mientras hablas. Enterprise AI para C-Suite.' },
  'landing.hero.p1':      { pt: 'IA que ',         en: 'AI that ',         es: 'IA que ' },
  'landing.hero.hl':      { pt: 'executa',          en: 'executes',         es: 'ejecuta' },
  'landing.hero.p2':      { pt: 'enquanto você fala', en: 'while you speak', es: 'mientras hablas' },
  'landing.hero.ctaFree': { pt: 'Começar grátis',  en: 'Get started free', es: 'Empezar gratis' },
  'landing.hero.ctaFinal':{ pt: 'Criar conta grátis', en: 'Create free account', es: 'Crear cuenta gratis' },
  'landing.hero.readyTitle': { pt: 'Pronto para',  en: 'Ready to',         es: 'Listo para' },
  'landing.hero.readyHl': { pt: 'Executar',         en: 'Execute',          es: 'Ejecutar' },
  'landing.hero.readySub':{ pt: 'Junte-se aos executivos que operam na velocidade das máquinas. Sua primeira sala de reunião é gratuita.', en: 'Join executives operating at machine speed. Your first meeting room is free.', es: 'Únete a los ejecutivos que operan a la velocidad de las máquinas. Tu primera sala de reunión es gratuita.' },
  'landing.hero.doubt':   { pt: 'Dúvidas?',         en: 'Questions?',       es: '¿Preguntas?' },
  'landing.guarantee.days':   { pt: '✓ 7 dias de garantia',  en: '✓ 7-day guarantee', es: '✓ 7 días de garantía' },
  'landing.guarantee.cancel': { pt: '✓ Cancele quando quiser', en: '✓ Cancel anytime', es: '✓ Cancela cuando quieras' },
  'landing.guarantee.noLock': { pt: '✓ Sem fidelidade',       en: '✓ No lock-in',     es: '✓ Sin permanencia' },
  // How it works steps
  'landing.step1.title': { pt: 'Configure sua sala', en: 'Configure your room', es: 'Configura tu sala' },
  'landing.step1.desc':  { pt: 'Defina o nome da IA, idioma e recursos disponíveis (voz, câmera, construtor de sites, documentos).', en: 'Define the AI name, language, and available resources (voice, camera, site builder, documents).', es: 'Define el nombre de la IA, idioma y recursos disponibles (voz, cámara, constructor de sitios, documentos).' },
  'landing.step2.title': { pt: 'Inicie a sessão ao vivo', en: 'Start the live session', es: 'Inicia la sesión en vivo' },
  'landing.step2.desc':  { pt: 'O APEX CORE ativa. Fale seus comandos — o Matrix Globe pulsa enquanto processa.', en: 'APEX CORE activates. Speak your commands — the Matrix Globe pulses while processing.', es: 'APEX CORE se activa. Habla tus comandos — el Matrix Globe pulsa mientras procesa.' },
  'landing.step3.title': { pt: 'Assista a execução', en: 'Watch the execution', es: 'Observa la ejecución' },
  'landing.step3.desc':  { pt: 'O terminal em tempo real mostra a infraestrutura sendo construída. Sites entram no ar. Documentos publicados. DNS configurado.', en: 'The real-time terminal shows infrastructure being built. Sites go live. Documents published. DNS configured.', es: 'El terminal en tiempo real muestra la infraestructura siendo construida. Sitios en línea. Documentos publicados. DNS configurado.' },
  // Features
  'landing.f1.title': { pt: 'Execução em Tempo Real', en: 'Real-Time Execution', es: 'Ejecución en Tiempo Real' },
  'landing.f1.desc':  { pt: 'Deploy de sites, configuração de DNS e publicação de documentos enquanto a reunião ainda acontece.', en: 'Site deployments, DNS configuration, and document publishing while the meeting is still happening.', es: 'Deploy de sitios, configuración de DNS y publicación de documentos mientras la reunión aún ocurre.' },
  'landing.f2.title': { pt: 'White-Label Total', en: 'Full White-Label', es: 'White-Label Completo' },
  'landing.f2.desc':  { pt: 'Renomeie o APEX CORE com a identidade da sua empresa. Sua marca, sua inteligência.', en: 'Rename APEX CORE with your company identity. Your brand, your intelligence.', es: 'Renombra APEX CORE con la identidad de tu empresa. Tu marca, tu inteligencia.' },
  'landing.f3.title': { pt: 'Terminal ao Vivo', en: 'Live Terminal', es: 'Terminal en Vivo' },
  'landing.f3.desc':  { pt: 'Acompanhe a infraestrutura sendo construída em tempo real com total transparência.', en: 'Watch infrastructure being built in real time with total transparency.', es: 'Observa la infraestructura siendo construida en tiempo real con total transparencia.' },
  'landing.f4.title': { pt: 'Segurança Enterprise', en: 'Enterprise Security', es: 'Seguridad Enterprise' },
  'landing.f4.desc':  { pt: 'Criptografia de ponta a ponta, conformidade com LGPD e arquitetura zero-knowledge.', en: 'End-to-end encryption, LGPD compliance, and zero-knowledge architecture.', es: 'Cifrado de extremo a extremo, cumplimiento LGPD y arquitectura zero-knowledge.' },
  'landing.f5.title': { pt: 'Voz + Visão', en: 'Voice + Vision', es: 'Voz + Visión' },
  'landing.f5.desc':  { pt: 'O APEX CORE lê sua câmera e escuta seus comandos simultaneamente.', en: 'APEX CORE reads your camera and listens to your commands simultaneously.', es: 'APEX CORE lee tu cámara y escucha tus comandos simultáneamente.' },
  'landing.f6.title': { pt: 'Deploy em < 60s', en: 'Deploy in < 60s', es: 'Deploy en < 60s' },
  'landing.f6.desc':  { pt: 'Da palavra falada à infraestrutura ao vivo em menos de 60 segundos.', en: 'From spoken word to live infrastructure in under 60 seconds.', es: 'De la palabra hablada a la infraestructura en vivo en menos de 60 segundos.' },
  // Use Cases
  'landing.uc1.title': { pt: 'Lançamento de Produtos', en: 'Product Launches', es: 'Lanzamiento de Productos' },
  'landing.uc1.desc':  { pt: 'O executivo diz "construa a landing page" — o APEX CORE publica antes da reunião terminar.', en: 'The executive says "build the landing page" — APEX CORE publishes it before the meeting ends.', es: 'El ejecutivo dice "construye la landing" — APEX CORE la publica antes de que termine la reunión.' },
  'landing.uc2.title': { pt: 'Apresentação para Clientes', en: 'Client Presentations', es: 'Presentaciones a Clientes' },
  'landing.uc2.desc':  { pt: 'Demonstre provas de conceito ao vivo durante a apresentação. Sem delays, sem follow-ups.', en: 'Demonstrate proof of concepts live during the presentation. No delays, no follow-ups.', es: 'Demuestra pruebas de concepto en vivo durante la presentación. Sin demoras, sin seguimientos.' },
  'landing.uc3.title': { pt: 'Board Sessions', en: 'Board Sessions', es: 'Sesiones de Directorio' },
  'landing.uc3.desc':  { pt: 'Gere e publique documentos do board, relatórios financeiros e ativos de conformidade sob comando.', en: 'Generate and publish board documents, financial reports, and compliance assets on command.', es: 'Genera y publica documentos del directorio, informes financieros y activos de cumplimiento bajo demanda.' },
  'landing.uc4.title': { pt: 'Revisões de Engenharia', en: 'Engineering Reviews', es: 'Revisiones de Ingeniería' },
  'landing.uc4.desc':  { pt: 'Configure ambientes de staging, registros DNS e pipelines CI/CD por voz.', en: 'Configure staging environments, DNS records, and CI/CD pipelines by voice.', es: 'Configura entornos de staging, registros DNS y pipelines CI/CD por voz.' },
  // Plans
  'landing.p1.period': { pt: '/mês', en: '/mo', es: '/mes' },
  'landing.p1.f1': { pt: '1 sala de reunião',        en: '1 meeting room',          es: '1 sala de reunión' },
  'landing.p1.f2': { pt: '5 sessões por mês',         en: '5 sessions/month',        es: '5 sesiones al mes' },
  'landing.p1.f3': { pt: 'IA APEX CORE padrão',       en: 'Standard APEX CORE AI',   es: 'IA APEX CORE estándar' },
  'landing.p1.f4': { pt: 'Suporte por email',          en: 'Email support',           es: 'Soporte por correo' },
  'landing.p1.f5': { pt: 'Terminal ao vivo',           en: 'Live terminal',           es: 'Terminal en vivo' },
  'landing.p1.cta': { pt: 'Começar agora',             en: 'Get started',             es: 'Empezar ahora' },
  'landing.p2.period': { pt: '/mês', en: '/mo', es: '/mes' },
  'landing.p2.f1': { pt: '10 salas de reunião',        en: '10 meeting rooms',        es: '10 salas de reunión' },
  'landing.p2.f2': { pt: 'Sessões ilimitadas',         en: 'Unlimited sessions',      es: 'Sesiones ilimitadas' },
  'landing.p2.f3': { pt: 'White-label completo',       en: 'Full white-label',        es: 'White-label completo' },
  'landing.p2.f4': { pt: 'Deploy automático',          en: 'Auto deployment',         es: 'Deploy automático' },
  'landing.p2.f5': { pt: 'Terminal ao vivo',           en: 'Live terminal',           es: 'Terminal en vivo' },
  'landing.p2.f6': { pt: 'Suporte prioritário',        en: 'Priority support',        es: 'Soporte prioritario' },
  'landing.p2.cta': { pt: 'Começar agora',             en: 'Get started',             es: 'Empezar ahora' },
  'landing.p3.price': { pt: 'Sob consulta',            en: 'Custom pricing',          es: 'Precio a consultar' },
  'landing.p3.f1': { pt: 'Salas ilimitadas',           en: 'Unlimited rooms',         es: 'Salas ilimitadas' },
  'landing.p3.f2': { pt: 'Subdomínio próprio',         en: 'Custom subdomain',        es: 'Subdominio propio' },
  'landing.p3.f3': { pt: 'SLA 99.9%',                 en: 'SLA 99.9%',               es: 'SLA 99.9%' },
  'landing.p3.f4': { pt: 'Onboarding dedicado',        en: 'Dedicated onboarding',    es: 'Onboarding dedicado' },
  'landing.p3.f5': { pt: 'Integrações customizadas',   en: 'Custom integrations',     es: 'Integraciones personalizadas' },
  'landing.p3.f6': { pt: 'Suporte 24/7',              en: '24/7 support',            es: 'Soporte 24/7' },
  'landing.p3.cta': { pt: 'Falar com vendas',          en: 'Talk to sales',           es: 'Hablar con ventas' },
  // FAQ landing inline
  'landing.faq.q1': { pt: 'O que é o APEX CORE MEETING?', en: 'What is APEX CORE MEETING?', es: '¿Qué es APEX CORE MEETING?' },
  'landing.faq.a1': { pt: 'O APEX CORE MEETING é uma plataforma de inteligência artificial enterprise que executa ações reais durante suas reuniões — deploy de sites, publicação de documentos, configuração de infraestrutura — tudo em tempo real, enquanto você fala.', en: 'APEX CORE MEETING is an enterprise AI platform that executes real actions during your meetings — site deployments, document publishing, infrastructure configuration — all in real time, while you speak.', es: 'APEX CORE MEETING es una plataforma de IA enterprise que ejecuta acciones reales durante tus reuniones — deploy de sitios, publicación de documentos, configuración de infraestructura — todo en tiempo real, mientras hablas.' },
  'landing.faq.q2': { pt: 'Preciso instalar alguma coisa?', en: 'Do I need to install anything?', es: '¿Necesito instalar algo?' },
  'landing.faq.a2': { pt: 'Não. O APEX CORE MEETING é 100% no navegador. Basta criar sua conta, configurar sua sala e começar a operar. Sem downloads, sem instalações.', en: 'No. APEX CORE MEETING is 100% browser-based. Just create your account, configure your room, and start operating. No downloads, no installations.', es: 'No. APEX CORE MEETING es 100% en el navegador. Solo crea tu cuenta, configura tu sala y empieza a operar. Sin descargas, sin instalaciones.' },
  'landing.faq.q3': { pt: 'Como o APEX CORE executa ações reais?', en: 'How does APEX CORE execute real actions?', es: '¿Cómo ejecuta APEX CORE acciones reales?' },
  'landing.faq.a3': { pt: 'Via APIs de DNS, hospedagem, documentos e serviços de nuvem. Quando você fala um comando, o APEX CORE interpreta, planeja e executa as ações necessárias usando integrações seguras com provedores de infraestrutura.', en: 'Via DNS, hosting, document, and cloud service APIs. When you speak a command, APEX CORE interprets, plans, and executes the necessary actions using secure integrations with infrastructure providers.', es: 'Mediante APIs de DNS, hosting, documentos y servicios en la nube. Cuando hablas un comando, APEX CORE interpreta, planifica y ejecuta las acciones necesarias usando integraciones seguras con proveedores de infraestructura.' },
  'landing.faq.q4': { pt: 'Posso renomear a IA com minha marca?', en: 'Can I rebrand the AI with my brand?', es: '¿Puedo renombrar la IA con mi marca?' },
  'landing.faq.a4': { pt: 'Sim! A partir do plano Pro você tem acesso ao White-Label completo. Renomeie a IA, personalize a interface e apresente como sua própria solução de inteligência artificial.', en: 'Yes! Starting with the Pro plan you get access to the full White-Label. Rename the AI, customize the interface, and present it as your own AI solution.', es: '¡Sí! A partir del plan Pro tienes acceso al White-Label completo. Renombra la IA, personaliza la interfaz y preséntala como tu propia solución de IA.' },
  'landing.faq.q5': { pt: 'Meus dados de reunião são seguros?', en: 'Is my meeting data safe?', es: '¿Son seguros mis datos de reunión?' },
  'landing.faq.a5': { pt: 'Absolutamente. Utilizamos criptografia end-to-end (E2E) em todos os dados de reunião. Estamos em conformidade com a LGPD e adotamos arquitetura zero-knowledge — seus dados são seus.', en: 'Absolutely. We use end-to-end encryption (E2E) on all meeting data. We are LGPD-compliant and adopt a zero-knowledge architecture — your data is yours.', es: 'Absolutamente. Utilizamos cifrado E2E en todos los datos de reunión. Cumplimos con la LGPD y adoptamos arquitectura zero-knowledge — tus datos son tuyos.' },
  'landing.faq.q6': { pt: 'Posso cancelar quando quiser?', en: 'Can I cancel anytime?', es: '¿Puedo cancelar cuando quiera?' },
  'landing.faq.a6': { pt: 'Sim, sem fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multas ou custos adicionais. Oferecemos também 7 dias de garantia de satisfação.', en: 'Yes, no lock-in. You can cancel at any time without penalties or additional costs. We also offer a 7-day satisfaction guarantee.', es: 'Sí, sin permanencia. Puedes cancelar en cualquier momento sin penalizaciones ni costos adicionales. También ofrecemos 7 días de garantía de satisfacción.' },

  // ── Validation (zod schemas) ─────────────────────────────────────────────────
  'valid.email':         { pt: 'Email inválido',                          en: 'Invalid email address',              es: 'Correo inválido' },
  'valid.passwordMin':   { pt: 'Senha deve ter ao menos 6 caracteres',    en: 'Password must be at least 6 characters', es: 'La contraseña debe tener al menos 6 caracteres' },
  'valid.nameMin':       { pt: 'Nome deve ter ao menos 2 caracteres',     en: 'Name must be at least 2 characters',  es: 'El nombre debe tener al menos 2 caracteres' },
  'valid.url':           { pt: 'URL inválida',                            en: 'Invalid URL',                         es: 'URL inválida' },
  'valid.titleMin':      { pt: 'Título deve ter ao menos 3 caracteres',   en: 'Title must be at least 3 characters', es: 'El título debe tener al menos 3 caracteres' },
  'valid.aiNameMin':     { pt: 'Nome da IA deve ter ao menos 2 caracteres', en: 'AI name must be at least 2 characters', es: 'El nombre de IA debe tener al menos 2 caracteres' },
  'valid.resourcesMin':  { pt: 'Selecione pelo menos um recurso',         en: 'Select at least one resource',        es: 'Selecciona al menos un recurso' },

  // ── Not Found ────────────────────────────────────────────────────────────────
  'notFound.subtitle':   { pt: 'Sistema não encontrado',   en: 'System not found',     es: 'Sistema no encontrado' },
  'notFound.desc':       { pt: 'O recurso solicitado não existe no banco de dados do APEX CORE.', en: 'The requested resource does not exist in the APEX CORE database.', es: 'El recurso solicitado no existe en la base de datos de APEX CORE.' },
  'notFound.cta':        { pt: 'Voltar à Base',            en: 'Return to Base',       es: 'Volver a la Base' },

  // ── New Meeting ───────────────────────────────────────────────────────────────
  'new.back':            { pt: 'Voltar ao Dashboard',       en: 'Back to Dashboard',    es: 'Volver al Dashboard' },
  'new.title':           { pt: 'Configurar Nova Reunião',   en: 'Configure New Meeting', es: 'Configurar Nueva Reunión' },
  'new.subtitle':        { pt: 'Configure sua sala de reunião com IA', en: 'Set up your AI-powered meeting room', es: 'Configura tu sala de reunión con IA' },
  'new.field.title':     { pt: 'Título da Reunião',         en: 'Meeting Title',        es: 'Título de la Reunión' },
  'new.field.company':   { pt: 'Nome da Empresa',           en: 'Company Name',         es: 'Nombre de la Empresa' },
  'new.field.description': { pt: 'Descrição',               en: 'Description',          es: 'Descripción' },
  'new.field.description.ph': { pt: 'Planejamento e revisão de execução trimestral', en: 'Quarterly planning and execution review', es: 'Planificación y revisión de ejecución trimestral' },
  'new.field.aiName':    { pt: 'Nome da IA (White-Label)',  en: 'AI Name (White-Label)', es: 'Nombre de IA (White-Label)' },
  'new.field.aiName.desc': { pt: 'Renomeie a IA com a identidade da sua marca', en: 'Rename the AI to your brand identity', es: 'Renombra la IA con la identidad de tu marca' },
  'new.field.language':  { pt: 'Idioma',                    en: 'Language',             es: 'Idioma' },
  'new.field.resources': { pt: 'Recursos Disponíveis',      en: 'Available Resources',  es: 'Recursos Disponibles' },
  'new.field.resources.desc': { pt: 'Selecione as ferramentas que o APEX CORE pode usar nesta reunião', en: 'Select tools APEX CORE can use during this meeting', es: 'Selecciona las herramientas que APEX CORE puede usar en esta reunión' },
  'new.field.briefing':  { pt: 'Briefing para a IA',        en: 'Briefing for AI',      es: 'Briefing para la IA' },
  'new.field.briefing.ph': { pt: 'Contexto: estamos lançando uma nova linha de produtos. A IA deve focar em velocidade e automação.', en: 'Context: We\'re launching a new product line. The AI should focus on speed and automation.', es: 'Contexto: estamos lanzando una nueva línea de productos. La IA debe enfocarse en velocidad y automatización.' },
  'new.field.briefing.desc': { pt: 'Contexto opcional para guiar o comportamento da IA', en: 'Optional context to guide AI behavior', es: 'Contexto opcional para guiar el comportamiento de la IA' },
  'new.cancel':          { pt: 'Cancelar',                  en: 'Cancel',               es: 'Cancelar' },
  'new.submit':          { pt: 'Criar Reunião',              en: 'Create Meeting',       es: 'Crear Reunión' },
  'new.creating':        { pt: 'Criando...',                 en: 'Creating...',          es: 'Creando...' },
  'new.toast.created':   { pt: 'Reunião criada',             en: 'Meeting created',      es: 'Reunión creada' },
  'new.toast.created.desc': { pt: 'Sua sala de reunião está pronta', en: 'Your meeting room is ready', es: 'Tu sala de reunión está lista' },
  'new.toast.error':     { pt: 'Erro ao criar reunião',      en: 'Failed to create meeting', es: 'Error al crear la reunión' },
  // Resources
  'new.res.voice':       { pt: 'Reconhecimento de Voz',     en: 'Voice Recognition',    es: 'Reconocimiento de Voz' },
  'new.res.voice.desc':  { pt: 'Fale comandos durante reuniões',  en: 'Speak commands during meetings', es: 'Habla comandos durante las reuniones' },
  'new.res.camera':      { pt: 'Câmera',                    en: 'Camera Feed',          es: 'Cámara' },
  'new.res.camera.desc': { pt: 'APEX CORE pode ver sua tela', en: 'APEX CORE can see your screen', es: 'APEX CORE puede ver tu pantalla' },
  'new.res.site':        { pt: 'Construtor de Sites',        en: 'Site Builder',         es: 'Constructor de Sitios' },
  'new.res.site.desc':   { pt: 'Publique sites em tempo real', en: 'Deploy websites in real-time', es: 'Publica sitios en tiempo real' },
  'new.res.docs':        { pt: 'Geração de Documentos',     en: 'Document Generation',  es: 'Generación de Documentos' },
  'new.res.docs.desc':   { pt: 'Gere e publique documentos', en: 'Generate and publish documents', es: 'Genera y publica documentos' },
  'new.res.dns':         { pt: 'Configuração de DNS',        en: 'DNS Configuration',    es: 'Configuración de DNS' },
  'new.res.dns.desc':    { pt: 'Configure domínios e registros DNS', en: 'Configure domains and DNS records', es: 'Configura dominios y registros DNS' },
  'new.res.tools':       { pt: 'Ferramentas de Dev',         en: 'Developer Tools',      es: 'Herramientas de Dev' },
  'new.res.tools.desc':  { pt: 'CI/CD, ambientes de staging', en: 'CI/CD, staging environments', es: 'CI/CD, entornos de staging' },

  // ── Common ───────────────────────────────────────────────────────────────────
  'common.error':         { pt: 'Erro',             en: 'Error',              es: 'Error' },
  'common.noDesc':        { pt: 'Sem descrição',    en: 'No description',     es: 'Sin descripción' },
  'common.sessions':      { pt: 'sessões',          en: 'sessions',           es: 'sesiones' },
  'common.cancel':        { pt: 'Cancelar',         en: 'Cancel',             es: 'Cancelar' },
  'common.delete':        { pt: 'Excluir',          en: 'Delete',             es: 'Eliminar' },
  'common.minutes':       { pt: 'minutos',          en: 'minutes',            es: 'minutos' },

  // ── Settings extra ────────────────────────────────────────────────────────────
  'settings.saved.desc':       { pt: 'Sua configuração white-label foi atualizada', en: 'Your white-label configuration has been updated', es: 'Tu configuración de marca blanca fue actualizada' },
  'settings.error.save':       { pt: 'Falha ao salvar configurações', en: 'Failed to save settings', es: 'Error al guardar configuración' },
  'settings.loading':          { pt: 'Carregando configurações...', en: 'Loading settings...', es: 'Cargando configuración...' },
  'settings.whiteLabel.desc':  { pt: 'Personalize a marca e aparência da IA para sua organização', en: 'Customize the AI branding and appearance for your organization', es: 'Personaliza la marca y apariencia de la IA para tu organización' },
  'settings.aiName.desc':      { pt: 'O nome exibido para seu assistente de IA', en: 'The name displayed for your AI assistant', es: 'El nombre mostrado para tu asistente de IA' },
  'settings.companyName.desc': { pt: 'O nome da sua organização', en: 'Your organization name', es: 'El nombre de tu organización' },
  'settings.logoUrl.desc':     { pt: 'URL para o logo da empresa (opcional)', en: 'URL to your company logo (optional)', es: 'URL del logo de tu empresa (opcional)' },
  'settings.primaryColor.desc':{ pt: 'Cor principal da marca (formato hex)', en: 'Main brand color (hex format)', es: 'Color principal de marca (formato hex)' },
  'settings.accentColor.desc': { pt: 'Cor secundária da marca (formato hex)', en: 'Secondary brand color (hex format)', es: 'Color secundario de marca (formato hex)' },
  'settings.subdomain.suffix': { pt: '.apex-core.ai', en: '.apex-core.ai', es: '.apex-core.ai' },
  'settings.subdomain.desc':   { pt: 'Subdomínio personalizado para sua organização (opcional)', en: 'Custom subdomain for your organization (optional)', es: 'Subdominio personalizado para tu organización (opcional)' },
  'settings.saving':           { pt: 'Salvando...', en: 'Saving...', es: 'Guardando...' },
  'settings.valid.aiName':     { pt: 'Nome da IA deve ter ao menos 2 caracteres', en: 'AI name must be at least 2 characters', es: 'El nombre de la IA debe tener al menos 2 caracteres' },
  'settings.valid.url':        { pt: 'URL inválida', en: 'Invalid URL', es: 'URL inválida' },
  'settings.valid.color':      { pt: 'Cor hex inválida', en: 'Invalid color hex', es: 'Color hex inválido' },
  'settings.valid.subdomain':  { pt: 'Apenas letras minúsculas, números e hífens', en: 'Only lowercase, numbers, and hyphens', es: 'Solo minúsculas, números y guiones' },

  // ── Live meeting ──────────────────────────────────────────────────────────────
  'live.session.started':     { pt: 'Sessão iniciada',                    en: 'Session started',                          es: 'Sesión iniciada' },
  'live.session.active':      { pt: 'APEX CORE está ativo',               en: 'APEX CORE is now active',                  es: 'APEX CORE está activo' },
  'live.session.failStart':   { pt: 'Falha ao iniciar sessão',            en: 'Failed to start session',                  es: 'Error al iniciar sesión' },
  'live.session.ended':       { pt: 'Sessão encerrada',                   en: 'Session ended',                            es: 'Sesión finalizada' },
  'live.session.failEnd':     { pt: 'Falha ao encerrar sessão',           en: 'Failed to end session',                    es: 'Error al finalizar sesión' },
  'live.voice.notSupported':  { pt: 'Voz não suportada',                  en: 'Voice not supported',                      es: 'Voz no soportada' },
  'live.voice.notSupportedDesc': { pt: 'Seu navegador não suporta reconhecimento de voz', en: 'Your browser does not support voice recognition', es: 'Tu navegador no soporta reconocimiento de voz' },
  'live.camera.enabled':      { pt: 'Câmera ativada',                     en: 'Camera enabled',                           es: 'Cámara activada' },
  'live.camera.enabledDesc':  { pt: 'APEX CORE agora pode ver sua transmissão', en: 'APEX CORE can now see your feed',    es: 'APEX CORE ahora puede ver tu transmisión' },
  'live.camera.error':        { pt: 'Erro na câmera',                     en: 'Camera error',                             es: 'Error de cámara' },
  'live.camera.errorDesc':    { pt: 'Falha ao acessar câmera',            en: 'Failed to access camera',                  es: 'Error al acceder a la cámara' },
  'live.mic.error':           { pt: 'Erro no microfone',                  en: 'Mic error',                                es: 'Error de micrófono' },
  'live.mic.errorDesc':       { pt: 'Não foi possível acessar o microfone', en: 'Could not access microphone',            es: 'No se pudo acceder al micrófono' },
  'live.command.failed':      { pt: 'Falha ao processar comando',         en: 'Failed to process command',                es: 'Error al procesar comando' },
  'live.scene.prompt':        { pt: 'Analise esta cena e descreva o que você vê', en: 'Analyze this scene and describe what you see', es: 'Analiza esta escena y describe lo que ves' },
  'live.scene.failed':        { pt: 'Falha ao analisar cena',             en: 'Failed to analyze scene',                  es: 'Error al analizar escena' },
  'live.initializing':        { pt: 'Iniciando APEX CORE...',             en: 'Initializing APEX CORE...',                es: 'Iniciando APEX CORE...' },
  'live.voiceControl':        { pt: 'Controle de Voz',                    en: 'Voice Control',                            es: 'Control de Voz' },
  'live.stop':                { pt: 'Parar',                              en: 'Stop',                                     es: 'Detener' },
  'live.stopListening':       { pt: 'Parar de Ouvir',                     en: 'Stop Listening',                           es: 'Dejar de Escuchar' },
  'live.startListening':      { pt: 'Começar a Ouvir',                    en: 'Start Listening',                          es: 'Empezar a Escuchar' },
  'live.typePlaceholder':     { pt: 'Ou digite seu comando… (Ctrl+Enter para enviar)', en: 'Or type your command… (Ctrl+Enter to send)', es: 'O escribe tu comando… (Ctrl+Enter para enviar)' },
  'live.sendCommand':         { pt: 'Enviar Comando',                     en: 'Send Command',                             es: 'Enviar Comando' },
  'live.cameraFeed':          { pt: 'Feed da Câmera',                     en: 'Camera Feed',                              es: 'Feed de Cámara' },
  'live.cameraDisabled':      { pt: 'Câmera desativada',                  en: 'Camera disabled',                          es: 'Cámara desactivada' },
  'live.analyzeScene':        { pt: 'Analisar Cena',                      en: 'Analyze Scene',                            es: 'Analizar Escena' },
  'live.execLog':             { pt: 'LOG DE EXECUÇÃO',                    en: 'EXECUTION LOG',                            es: 'REGISTRO DE EJECUCIÓN' },
  'live.noExecutions':        { pt: 'Nenhuma execução ainda. Comece a falar comandos...', en: 'No executions yet. Start speaking commands...', es: 'Sin ejecuciones aún. Empieza a hablar comandos...' },
  'live.transcript':          { pt: 'TRANSCRIÇÃO',                        en: 'TRANSCRIPT',                               es: 'TRANSCRIPCIÓN' },
  'live.noConversation':      { pt: 'Nenhuma conversa ainda. Comece a falar...', en: 'No conversation yet. Start speaking...', es: 'Sin conversación aún. Empieza a hablar...' },
  'live.mode.processing':     { pt: 'PROCESSANDO',                        en: 'PROCESSING',                               es: 'PROCESANDO' },
  'live.mode.speaking':       { pt: 'FALANDO',                            en: 'SPEAKING',                                 es: 'HABLANDO' },
  'live.mode.listening':      { pt: 'OUVINDO',                            en: 'LISTENING',                                es: 'ESCUCHANDO' },
  'live.mode.standby':        { pt: 'ESPERA',                             en: 'STANDBY',                                  es: 'ESPERA' },

  // ── Meeting detail ────────────────────────────────────────────────────────────
  'meeting.deleted':          { pt: 'Reunião excluída',                   en: 'Meeting deleted',                          es: 'Reunión eliminada' },
  'meeting.failDelete':       { pt: 'Falha ao excluir reunião',           en: 'Failed to delete meeting',                 es: 'Error al eliminar reunión' },
  'meeting.loading':          { pt: 'Carregando reunião...',              en: 'Loading meeting...',                       es: 'Cargando reunión...' },
  'meeting.notFound':         { pt: 'Reunião não encontrada',             en: 'Meeting not found',                        es: 'Reunión no encontrada' },
  'meeting.backDashboard':    { pt: 'Voltar ao painel',                   en: 'Back to Dashboard',                        es: 'Volver al panel' },
  'meeting.noDesc':           { pt: 'Sem descrição',                      en: 'No description',                           es: 'Sin descripción' },
  'meeting.sessionsLabel':    { pt: 'sessões',                            en: 'sessions',                                 es: 'sesiones' },
  'meeting.companyLabel':     { pt: 'Empresa: ',                          en: 'Company: ',                                es: 'Empresa: ' },
  'meeting.aiLabel':          { pt: 'IA: ',                               en: 'AI: ',                                     es: 'IA: ' },
  'meeting.resources':        { pt: 'Recursos Disponíveis',               en: 'Available Resources',                      es: 'Recursos Disponibles' },
  'meeting.history':          { pt: 'Histórico de Sessões',               en: 'Session History',                          es: 'Historial de Sesiones' },
  'meeting.minutes':          { pt: 'minutos',                            en: 'minutes',                                  es: 'minutos' },
  'meeting.endedAt':          { pt: 'Encerrada ',                         en: 'Ended ',                                   es: 'Finalizada ' },
  'meeting.builtAssets':      { pt: 'Ativos Construídos:',                en: 'Built Assets:',                            es: 'Activos Construidos:' },
  'meeting.noSessions':       { pt: 'Nenhuma sessão ainda',               en: 'No sessions yet',                          es: 'Aún no hay sesiones' },
  'meeting.startFirst':       { pt: 'Inicie sua primeira sessão ao vivo para começar a executar', en: 'Start your first live session to begin executing', es: 'Inicia tu primera sesión en vivo para comenzar a ejecutar' },
  'meeting.deleteTitle':      { pt: 'Excluir Reunião?',                   en: 'Delete Meeting?',                          es: '¿Eliminar Reunión?' },
  'meeting.deleteDescPre':    { pt: 'Isso excluirá permanentemente "',    en: 'This will permanently delete "',           es: 'Esto eliminará permanentemente "' },
  'meeting.deleteDescPost':   { pt: '" e todas as suas sessões. Essa ação não pode ser desfeita.', en: '" and all its sessions. This action cannot be undone.', es: '" y todas sus sesiones. Esta acción no se puede deshacer.' },

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
