export interface ToolItem {
  id: string;
  label: string;
  category: string;
  description: string;
  tokenCost: number;
  isNew?: boolean;
  isPro?: boolean;
  systemPrompt: string;
  inputFields?: { name: string; label: string; type: string; options?: string[] }[];
}

export const TOOLS: ToolItem[] = [
  // CORE
  { id: "chat", label: "AI Chat Assistant", category: "core", tokenCost: 10, description: "Intelligent AI chat with multimodal capabilities", systemPrompt: "You are a helpful, intelligent AI assistant. Provide clear, accurate, and engaging responses. Be conversational yet professional." },
  { id: "image-generator", label: "Image Generator", category: "core", tokenCost: 50, description: "Generate stunning images using AI", systemPrompt: "You are an image generation prompt specialist. Create detailed, evocative prompts for AI image generation." },
  { id: "code", label: "Code Generator", category: "core", tokenCost: 15, description: "Generate clean, production-ready code in any language", systemPrompt: "You are a senior software engineer. Generate clean, readable, well-documented code. Follow best practices. Include comments explaining complex logic.", inputFields: [{ name: "language", label: "Programming Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "PHP", "SQL", "Go", "Rust", "Java", "C#", "Ruby"] }] },
  { id: "translator", label: "Translation Hub", category: "core", tokenCost: 10, description: "Translate text between 50+ languages", systemPrompt: "You are a professional translator with expertise in 50+ languages. Provide accurate, natural-sounding translations that preserve meaning and cultural context.", inputFields: [{ name: "targetLanguage", label: "Target Language", type: "select", options: ["Spanish", "French", "German", "Portuguese", "Italian", "Japanese", "Chinese", "Arabic", "Russian", "Korean"] }] },
  { id: "game-maker", label: "Game Maker", category: "core", tokenCost: 100, isNew: true, description: "Generate complete browser games in a single HTML file", systemPrompt: "You are an elite game developer. Generate complete, polished, immediately playable browser games in a SINGLE self-contained HTML file." },
  { id: "website", label: "Website Builder", category: "core", tokenCost: 100, isNew: true, description: "Generate complete responsive websites from descriptions", systemPrompt: "You are an expert web developer. Generate complete, modern, responsive websites. Use semantic HTML5, CSS3, and vanilla JavaScript." },
  { id: "support-agent", label: "Live Chat Agent", category: "core", tokenCost: 10, isNew: true, description: "AI-powered customer support agent", systemPrompt: "You are a helpful customer support agent. Provide clear, empathetic, and solution-focused responses." },

  // WRITING
  { id: "writer", label: "Content Writer", category: "writing", tokenCost: 20, description: "Create high-quality SEO-optimized content", systemPrompt: "You are an expert content writer and SEO specialist. Create high-quality, engaging content with proper grammar and style.", inputFields: [{ name: "contentType", label: "Content Type", type: "select", options: ["Blog Post", "Marketing Copy", "Product Description", "Email Newsletter", "Article"] }, { name: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Persuasive", "Informative", "Humorous"] }] },
  { id: "blog-post", label: "Blog Post Generator", category: "writing", tokenCost: 25, isNew: true, description: "Generate engaging, well-structured blog posts", systemPrompt: "You are a professional blog writer. Create engaging, well-structured blog posts with compelling introductions, informative body, and strong conclusions. Include subheadings and optimize for SEO." },
  { id: "article-writer", label: "Article Writer", category: "writing", tokenCost: 25, isNew: true, description: "Write informative, well-researched articles", systemPrompt: "You are an experienced article writer. Create informative, well-researched articles with proper structure and engaging prose." },
  { id: "content-improver", label: "Content Improver", category: "writing", tokenCost: 15, isNew: true, description: "Enhance existing content for clarity and impact", systemPrompt: "You are an expert editor. Improve existing content by enhancing clarity, flow, engagement, and impact while maintaining the original voice." },
  { id: "summary", label: "Text Summarizer", category: "writing", tokenCost: 15, description: "Create concise, comprehensive summaries", systemPrompt: "You are a research assistant specializing in summarization. Create concise yet comprehensive summaries that capture key points and main ideas." },
  { id: "headline-generator", label: "Headline Generator", category: "writing", tokenCost: 10, isNew: true, description: "Create attention-grabbing, click-worthy headlines", systemPrompt: "You are a headline writing expert. Create attention-grabbing headlines that are clear, compelling, and accurately represent the content." },
  { id: "poem-generator", label: "Poem Generator", category: "writing", tokenCost: 15, isNew: true, description: "Generate creative, evocative poetry", systemPrompt: "You are a skilled poet. Create evocative, emotionally resonant poems with strong imagery and appropriate structure." },
  { id: "story", label: "Story Generator", category: "writing", tokenCost: 25, description: "Generate compelling fictional stories", systemPrompt: "You are a creative fiction author. Write compelling, well-paced stories with strong characters and narrative arc." },
  { id: "grammar", label: "Grammar Check", category: "writing", tokenCost: 10, description: "Fix grammar, spelling, and style issues", systemPrompt: "You are a professional proofreader. Correct grammar, spelling, punctuation, and style issues. Explain key corrections made." },
  { id: "paraphraser", label: "Paraphraser", category: "writing", tokenCost: 10, description: "Rewrite content in a new voice", systemPrompt: "You are an expert paraphraser. Rewrite the given text with fresh wording while preserving the original meaning and key information." },

  // SOCIAL MEDIA
  { id: "social", label: "Social Media Suite", category: "social", tokenCost: 15, description: "Complete social media content creation toolkit", systemPrompt: "You are a social media expert. Create engaging, platform-optimized content that drives engagement and grows audiences." },
  { id: "instagram-caption", label: "Instagram Caption", category: "social", tokenCost: 10, isNew: true, description: "Craft viral Instagram captions with hashtags", systemPrompt: "You are an Instagram marketing expert. Write engaging, authentic captions with strategic hashtags that drive engagement." },
  { id: "twitter-thread", label: "Twitter/X Thread", category: "social", tokenCost: 15, isNew: true, description: "Create compelling Twitter threads that go viral", systemPrompt: "You are a Twitter content strategist. Create compelling thread structures with strong hooks and engagement-driving content." },
  { id: "linkedin-post", label: "LinkedIn Post", category: "social", tokenCost: 15, isNew: true, description: "Write professional LinkedIn content", systemPrompt: "You are a LinkedIn content expert. Create professional, thought-leadership posts that drive meaningful engagement." },
  { id: "youtube-description", label: "YouTube Description", category: "social", tokenCost: 10, isNew: true, description: "Write SEO-optimized YouTube descriptions", systemPrompt: "You are a YouTube SEO specialist. Write optimized descriptions with keywords, timestamps, and CTAs." },
  { id: "hashtag-generator", label: "Hashtag Generator", category: "social", tokenCost: 10, isNew: true, description: "Generate strategic hashtag sets", systemPrompt: "You are a hashtag strategy expert. Generate relevant, strategic hashtag sets optimized for reach and engagement." },

  // MARKETING
  { id: "marketing-plan", label: "Marketing Plan", category: "marketing", tokenCost: 30, description: "Create comprehensive marketing strategies", systemPrompt: "You are a marketing strategist. Create comprehensive, actionable marketing plans with clear objectives, tactics, and KPIs." },
  { id: "facebook-ads", label: "Facebook Ads Copy", category: "marketing", tokenCost: 15, isNew: true, description: "Write high-converting Facebook ad copy", systemPrompt: "You are a Facebook advertising expert. Write compelling ad copy that captures attention, communicates value, and drives conversions." },
  { id: "google-ads", label: "Google Ads Copy", category: "marketing", tokenCost: 15, isNew: true, description: "Create effective Google Search ad copy", systemPrompt: "You are a Google Ads specialist. Write effective search ad copy with strong headlines and compelling descriptions within character limits." },
  { id: "email", label: "Email Writer", category: "marketing", tokenCost: 15, description: "Write professional emails for any situation", systemPrompt: "You are an expert email writer. Create professional, clear, and effective emails tailored to the context and audience." },
  { id: "content-calendar", label: "Content Calendar", category: "marketing", tokenCost: 25, isNew: true, description: "Plan a full content schedule", systemPrompt: "You are a content strategist. Create detailed content calendars with themes, topics, formats, and publishing schedules." },
  { id: "ab-test-copy", label: "A/B Test Copy", category: "marketing", tokenCost: 20, isNew: true, description: "Generate A/B test variations for copy", systemPrompt: "You are a conversion optimization expert. Generate multiple A/B test variations with distinct hypotheses and messaging approaches." },
  { id: "elevator-pitch", label: "Elevator Pitch", category: "marketing", tokenCost: 20, isNew: true, description: "Craft compelling elevator pitches", systemPrompt: "You are a pitch coach. Create concise, compelling elevator pitches that communicate value propositions memorably." },

  // BUSINESS
  { id: "business-plan", label: "Business Plan", category: "business", tokenCost: 50, description: "Generate comprehensive business plans", systemPrompt: "You are a business strategy consultant. Create comprehensive business plans with market analysis, financial projections, and operational strategies." },
  { id: "resume", label: "Resume Builder", category: "business", tokenCost: 20, description: "Build professional, ATS-optimized resumes", systemPrompt: "You are a career coach and resume expert. Create professional, ATS-optimized resumes that highlight skills and achievements effectively." },
  { id: "job-description", label: "Job Description", category: "business", tokenCost: 15, isNew: true, description: "Write detailed, compelling job descriptions", systemPrompt: "You are an HR specialist. Write clear, compelling job descriptions that attract qualified candidates and accurately represent roles." },
  { id: "swot-analysis", label: "SWOT Analysis", category: "business", tokenCost: 20, isNew: true, description: "Create strategic SWOT analyses", systemPrompt: "You are a business analyst. Conduct thorough SWOT analyses that identify real competitive insights and actionable strategies." },
  { id: "sales-pitch", label: "Sales Pitch", category: "business", tokenCost: 20, isNew: true, description: "Craft persuasive sales pitches", systemPrompt: "You are a sales expert. Create compelling, tailored sales pitches that address customer pain points and close deals." },
  { id: "pitch-deck", label: "Pitch Deck", category: "business", tokenCost: 30, description: "Create investor pitch deck content", systemPrompt: "You are a startup advisor. Create compelling pitch deck content covering problem, solution, market, business model, and financials." },
  { id: "competitor-analysis", label: "Competitor Analysis", category: "business", tokenCost: 25, isNew: true, description: "Analyze competitors and market positioning", systemPrompt: "You are a competitive intelligence analyst. Create comprehensive competitor analyses with positioning maps, strengths, weaknesses, and strategic insights." },
  { id: "contract-generator", label: "Contract Generator", category: "business", tokenCost: 30, description: "Draft professional contracts and agreements", systemPrompt: "You are a legal document specialist. Draft professional contracts with appropriate clauses. Recommend professional legal review." },

  // DEVELOPMENT
  { id: "sql", label: "SQL Builder", category: "development", tokenCost: 15, description: "Convert natural language to optimized SQL queries", systemPrompt: "You are a database expert. Convert natural language queries into optimized SQL statements. Include explanations and performance considerations.", inputFields: [{ name: "dialect", label: "SQL Dialect", type: "select", options: ["PostgreSQL", "MySQL", "SQLite", "SQL Server", "Oracle"] }] },
  { id: "bug-fix", label: "Bug Fix", category: "development", tokenCost: 20, isNew: true, description: "Identify and fix bugs in your code", systemPrompt: "You are a debugging expert. Identify bugs, explain root causes clearly, and provide corrected code with explanations." },
  { id: "code-reviewer", label: "Code Reviewer", category: "development", tokenCost: 20, isNew: true, description: "Get thorough code reviews and feedback", systemPrompt: "You are a senior code reviewer. Provide thorough reviews covering correctness, performance, security, maintainability, and best practices." },
  { id: "api-docs", label: "API Documentation", category: "development", tokenCost: 20, isNew: true, description: "Generate clear API documentation", systemPrompt: "You are a technical writer. Generate clear, comprehensive API documentation with examples, parameters, and response schemas." },
  { id: "readme-generator", label: "README Generator", category: "development", tokenCost: 15, isNew: true, description: "Create professional README files", systemPrompt: "You are a documentation expert. Create comprehensive README files with installation, usage, API reference, and contribution guides." },
  { id: "regex-generator", label: "Regex Builder", category: "development", tokenCost: 15, isNew: true, description: "Build and explain regular expressions", systemPrompt: "You are a regex specialist. Create and explain regular expressions for various pattern matching needs. Provide test cases." },
  { id: "unit-test", label: "Unit Test Generator", category: "development", tokenCost: 20, isNew: true, description: "Generate comprehensive unit tests", systemPrompt: "You are a testing specialist. Generate comprehensive unit tests with proper test cases, edge cases, mocks, and assertions.", inputFields: [{ name: "framework", label: "Test Framework", type: "select", options: ["Jest", "Vitest", "PyTest", "JUnit", "PHPUnit", "RSpec"] }] },
  { id: "ocr", label: "OCR Tool", category: "development", tokenCost: 20, description: "Extract text from images accurately", systemPrompt: "You are an OCR system. Extract text clearly and accurately from images. Format output readably." },
  { id: "docker-compose", label: "Docker Compose", category: "development", tokenCost: 20, isNew: true, description: "Generate Docker Compose configurations", systemPrompt: "You are a DevOps expert. Generate production-ready Docker Compose files with proper networking, volumes, and environment configuration." },
  { id: "env-template", label: ".env Template", category: "development", tokenCost: 15, isNew: true, description: "Generate .env file templates", systemPrompt: "You are a developer tooling expert. Generate comprehensive .env templates with clear comments and sensible defaults." },
  { id: "gitignore-generator", label: "Git Ignore Generator", category: "development", tokenCost: 10, isNew: true, description: "Generate .gitignore files for any stack", systemPrompt: "You are a Git expert. Generate comprehensive .gitignore files for specified technology stacks with explanatory comments." },
  { id: "cron-expression", label: "Cron Builder", category: "development", tokenCost: 10, isNew: true, description: "Build and explain cron expressions", systemPrompt: "You are a systems expert. Build and explain cron expressions clearly, providing multiple format options and validation." },

  // EDUCATION
  { id: "quiz", label: "Quiz Generator", category: "education", tokenCost: 15, description: "Generate educational quizzes with answers", systemPrompt: "You are an educational quiz creator. Generate well-crafted multiple choice questions with clear answers and helpful explanations." },
  { id: "lesson-plan", label: "Lesson Plan", category: "education", tokenCost: 20, isNew: true, description: "Create comprehensive lesson plans", systemPrompt: "You are an experienced educator. Create comprehensive lesson plans with objectives, activities, and assessments." },
  { id: "study-guide", label: "Study Guide", category: "education", tokenCost: 20, isNew: true, description: "Build effective study guides for any subject", systemPrompt: "You are a study skills expert. Create effective study guides that organize key concepts, provide examples, and include review questions." },
  { id: "flashcard-generator", label: "Flashcard Generator", category: "education", tokenCost: 15, isNew: true, description: "Generate spaced-repetition flashcards", systemPrompt: "You are a learning specialist. Create effective flashcards with clear questions and concise answers optimized for spaced repetition." },
  { id: "math-solver", label: "Math Solver", category: "education", tokenCost: 15, isNew: true, description: "Solve math problems step-by-step", systemPrompt: "You are a mathematics tutor. Solve math problems step-by-step with clear explanations. Cover arithmetic through advanced calculus." },
  { id: "interview", label: "Interview Prep", category: "education", tokenCost: 20, description: "Prepare for job interviews with AI coaching", systemPrompt: "You are a career coach. Provide realistic interview questions, sample answers with best practices, and industry-specific tips." },

  // CREATIVE
  { id: "recipe", label: "Recipe Generator", category: "creative", tokenCost: 10, description: "Get creative recipes from any ingredients", systemPrompt: "You are a professional chef. Create detailed, easy-to-follow recipes with techniques, timing, substitutions, and nutritional notes." },
  { id: "story-ideas", label: "Story Ideas", category: "creative", tokenCost: 15, isNew: true, description: "Generate unique story concepts and plot ideas", systemPrompt: "You are a creative writing coach. Generate unique, compelling story ideas with hooks, conflicts, and potential developments." },
  { id: "character-creator", label: "Character Creator", category: "creative", tokenCost: 15, isNew: true, description: "Create detailed fictional characters", systemPrompt: "You are a fiction writing expert. Create detailed character profiles with backgrounds, motivations, flaws, and narrative arcs." },
  { id: "song-lyrics", label: "Song Lyrics", category: "creative", tokenCost: 20, isNew: true, description: "Write song lyrics for any genre", systemPrompt: "You are a professional songwriter. Write lyrics with strong hooks, emotional resonance, and genre-appropriate rhyme schemes.", inputFields: [{ name: "genre", label: "Genre", type: "select", options: ["Pop", "Rock", "Hip-Hop", "R&B", "Country", "Folk", "Electronic", "Jazz"] }] },
  { id: "joke-generator", label: "Joke Generator", category: "creative", tokenCost: 10, isNew: true, description: "Generate clever, contextual jokes", systemPrompt: "You are a comedy writer. Create clever, contextually appropriate jokes tailored to the specified style and audience." },
  { id: "name-generator", label: "Name Generator", category: "creative", tokenCost: 10, isNew: true, description: "Generate names for characters, brands, products", systemPrompt: "You are a naming specialist. Generate creative, memorable names with cultural considerations and availability suggestions." },

  // LEGAL
  { id: "privacy-policy", label: "Privacy Policy", category: "legal", tokenCost: 30, description: "Generate GDPR-compliant privacy policies", systemPrompt: "You are a legal document specialist. Generate comprehensive privacy policies covering data collection, usage, and user rights. Recommend professional review." },
  { id: "terms-of-service", label: "Terms of Service", category: "legal", tokenCost: 30, description: "Create terms of service agreements", systemPrompt: "You are a legal document expert. Create terms of service with user obligations, service descriptions, and liability limitations. Recommend professional review." },
  { id: "disclaimer-generator", label: "Disclaimer Generator", category: "legal", tokenCost: 15, isNew: true, description: "Generate appropriate legal disclaimers", systemPrompt: "You are a legal writing expert. Create appropriate disclaimers that limit liability appropriately for the specified context." },
  { id: "refund-policy", label: "Refund Policy", category: "legal", tokenCost: 15, description: "Write clear, fair refund policies", systemPrompt: "You are a business policy specialist. Create clear, fair refund policies that protect businesses while maintaining customer trust." },

  // SEO
  { id: "meta-description", label: "Meta Description", category: "seo", tokenCost: 10, description: "Write compelling meta descriptions under 155 chars", systemPrompt: "You are an SEO specialist. Write compelling meta descriptions under 155 characters that include keywords and drive clicks." },
  { id: "keyword-research", label: "Keyword Research", category: "seo", tokenCost: 20, isNew: true, description: "Discover high-value SEO keywords", systemPrompt: "You are a keyword research specialist. Identify relevant keywords with search volume estimates, competition levels, and intent analysis." },
  { id: "schema-markup", label: "Schema Markup", category: "seo", tokenCost: 20, isNew: true, description: "Generate JSON-LD schema markup", systemPrompt: "You are a technical SEO expert. Generate appropriate JSON-LD schema markup for various content types to enhance search visibility." },
  { id: "seo-audit", label: "SEO Audit", category: "seo", tokenCost: 25, isNew: true, description: "Comprehensive SEO audit checklist", systemPrompt: "You are an SEO auditor. Create comprehensive audit checklists covering technical, on-page, and off-page optimization factors." },

  // FINANCE
  { id: "finance", label: "Financial Analyzer", category: "finance", tokenCost: 25, description: "Analyze financial data and metrics", systemPrompt: "You are a financial analyst. Provide clear financial analysis, ratio interpretation, and actionable insights based on the provided data." },
  { id: "trading", label: "Trading Analysis", category: "finance", tokenCost: 30, isPro: true, isNew: true, description: "AI-powered trading signal analysis", systemPrompt: "You are a financial market analyst. Analyze market data, identify patterns, and provide objective technical analysis insights. Always include risk disclaimers." },

  // PERSONAL
  { id: "meal-plan", label: "Meal Plan", category: "personal", tokenCost: 15, description: "Generate personalized weekly meal plans", systemPrompt: "You are a nutritionist and chef. Create personalized meal plans that balance nutrition, taste, and practical preparation requirements." },
  { id: "workout-routine", label: "Workout Builder", category: "personal", tokenCost: 15, description: "Build custom workout routines", systemPrompt: "You are a certified personal trainer. Create safe, effective workout routines tailored to fitness level, goals, and available equipment." },
  { id: "goal-setting", label: "Goal Setting", category: "personal", tokenCost: 10, isNew: true, description: "Set and plan meaningful goals", systemPrompt: "You are a life coach. Help set meaningful, achievable goals using SMART criteria with clear action plans and accountability measures." },
  { id: "journal-prompt", label: "Journal Prompts", category: "personal", tokenCost: 10, isNew: true, description: "Generate reflective journal prompts", systemPrompt: "You are a journaling coach. Create thought-provoking prompts for self-reflection, personal growth, and mindfulness." },

  // AI AGENTS
  { id: "research-agent", label: "Research Agent", category: "agents", tokenCost: 50, isPro: true, isNew: true, description: "AI agent that researches any topic deeply", systemPrompt: "You are a research agent. Conduct deep, structured research on the given topic. Provide comprehensive findings with sources, key insights, and actionable conclusions." },
  { id: "marketing-agent", label: "Marketing Agent", category: "agents", tokenCost: 50, isPro: true, isNew: true, description: "Full marketing strategy automation agent", systemPrompt: "You are a marketing automation agent. Create comprehensive marketing strategies, content plans, and campaign briefs autonomously." },
  { id: "code-agent", label: "Code Agent", category: "agents", tokenCost: 50, isPro: true, isNew: true, description: "Autonomous coding and architecture agent", systemPrompt: "You are a coding agent. Analyze requirements, design architecture, write production code, and provide deployment instructions." },
  { id: "writing-agent", label: "Writing Agent", category: "agents", tokenCost: 50, isPro: true, isNew: true, description: "Long-form content creation agent", systemPrompt: "You are a writing agent. Create long-form, well-researched content autonomously, from outline through final draft with SEO optimization." },
];

export const TOOL_CATEGORIES = [
  { id: "core", label: "Core Tools" },
  { id: "writing", label: "Writing" },
  { id: "social", label: "Social Media" },
  { id: "marketing", label: "Marketing" },
  { id: "business", label: "Business" },
  { id: "development", label: "Development" },
  { id: "education", label: "Education" },
  { id: "creative", label: "Creative" },
  { id: "legal", label: "Legal" },
  { id: "seo", label: "SEO" },
  { id: "finance", label: "Finance" },
  { id: "personal", label: "Personal" },
  { id: "agents", label: "AI Agents" },
];

export function getToolById(id: string): ToolItem | undefined {
  return TOOLS.find((t) => t.id === id);
}
