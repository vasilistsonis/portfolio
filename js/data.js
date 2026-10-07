// All page content lives here. Edit freely — the world and the copy rebuild from this file.

export const profile = {
  name: 'Vasilis Tsonis',
  role: 'Solutions engineer · Dynamics 365, Azure & web',
  location: 'Athens, Greece',
  employer: 'Telekom (Deutsche Telekom Group)',
  email: 'vasilis.tsonis2001@gmail.com',
  linkedin: 'https://www.linkedin.com/in/vasileios-tsonis-2a60191b9/',
  github: 'https://github.com/vasilistsonis',
  cv: 'assets/Vasilis-Tsonis-CV.pdf', // drop your CV at this path
  intro:
    'I build the systems companies actually run on: Dynamics 365 and Dataverse back ends, C# plugins and Azure Functions, React and Power Apps front ends, and the APIs, databases and automation between them. Outside of client work I ship my own products end to end.',
};

// Skills grouped the way the platform is layered. Each one lists the project ids it shows up in,
// so hovering a skill lights up the matching nodes in the world.
export const skills = [
  { id: 'dataverse', label: 'Dataverse & data modelling', group: 'platform', projects: ['sdm', 'rollout', 'assets', 'takeover', 'approvals'] },
  { id: 'plugins', label: 'C# plugins', group: 'platform', projects: ['approvals', 'plugins-repo'] },
  { id: 'jsweb', label: 'JavaScript web resources', group: 'platform', projects: ['approvals', 'js-repo'] },
  { id: 'mda', label: 'Model-driven apps', group: 'platform', projects: ['rollout', 'approvals', 'sdm'] },
  { id: 'canvas', label: 'Canvas apps', group: 'platform', projects: ['qms', 'postboard'] },
  { id: 'codeapps', label: 'Power Apps Code Apps', group: 'platform', projects: ['postboard', 'qms', 'takeover', 'onboarding'] },
  { id: 'flows', label: 'Power Automate', group: 'platform', projects: ['qms', 'assets', 'contract-alerts', 'postboard'] },
  { id: 'spo', label: 'SharePoint Online', group: 'platform', projects: ['postboard', 'qms', 'contract-alerts', 'takeover'] },
  { id: 'azure', label: 'Azure', group: 'cloud', projects: ['roi', 'coach', 'echo'] },
  { id: 'react', label: 'React & TypeScript', group: 'web', projects: ['postboard', 'hoops', 'roi', 'medanatomy', 'quotetrack', 'onboarding'] },
  { id: 'supabase', label: 'Supabase & Postgres', group: 'web', projects: ['hoops', 'medanatomy', 'quotetrack', 'coach'] },
  { id: 'ai', label: 'LLM integration', group: 'cloud', projects: ['roi', 'coach', 'echo', 'travelbuddy', 'onboarding'] },
  { id: 'woo', label: 'WordPress & WooCommerce', group: 'web', projects: ['kartelfam', 'voreva'] },
  { id: 'nextjs', label: 'Next.js', group: 'web', projects: ['aphrodite', 'quotetrack', 'stargym'] },
];

// Client engagements. Clients are described by sector, not named.
// `label` is what the station in the 3D world shows: what the product does. `accent: 'magenta'` tints it.
export const engagements = [
  {
    id: 'qms',
    sector: 'Healthcare',
    label: 'Quality document control',
    title: 'Quality-management document control',
    short: 'Controlled documents, multi-step approvals and a library-per-type SharePoint design for a hospital group.',
    detail: [
      'Built first as a Power Apps Code App (React/TypeScript), then rebuilt as a Canvas App when the client preferred to avoid Premium licensing.',
      'Eleven document-type libraries plus Under Approval, External and History libraries; the document type decides where a file lands.',
      'Approval steps are configurable per document and assigned to roles; every approver in a step must approve before the next step runs, and a rejection notifies Quality without killing the process.',
      'Permissions come from M365 groups per department, so the client maintains access without touching the app.',
    ],
    stack: ['Canvas apps', 'Power Automate', 'SharePoint Online', 'Code Apps'],
  },
  {
    id: 'approvals',
    sector: 'Aviation',
    label: 'Expense & purchase approvals',
    title: 'Expense and purchase approvals in Dynamics 365',
    short: 'Travel-expense and purchase-requisition apps with plugin-driven approval logic for an international airport.',
    detail: [
      'Model-driven apps backed by C# plugins for the approval workflow, with ribbon commands that open and close editing on a record.',
      'Diagnosed a "My pending approvals" dashboard that opened the wrong record: grids bound to the approval entity instead of the parent, plus a card-view reflow bug that changed click behaviour with window width.',
      'Power Automate repairs and JavaScript web resources on the forms.',
    ],
    stack: ['Model-driven apps', 'C# plugins', 'JavaScript web resources', 'Power Automate'],
  },
  {
    id: 'postboard',
    sector: 'Packaging',
    label: 'Team collaboration board',
    title: 'PostBoard: team board as a Power Apps Code App',
    short: 'Replaced an aging Canvas App with a React/TypeScript Code App over eight SharePoint lists.',
    detail: [
      'Channels, posts, tasks, analysis, users, notifications and attachments, all read and written through the SharePoint REST API.',
      'Solved email-versus-UPN identity mismatches with claims-based matching, corrected MSAL scopes, and moved mention notifications to the Office 365 connector.',
      'Earlier phase on the Canvas App: PowerShell remediation of ~4,000 post bodies, delegation workarounds and a UserMulti migration for assignees.',
      'Also architected the multi-country rollout of the same client\'s SAP material-creation solution, with scope documents and effort estimates.',
    ],
    stack: ['Code Apps', 'React', 'SharePoint Online', 'Power Automate', 'MSAL'],
  },
  {
    id: 'rollout',
    sector: 'Retail network',
    label: 'Store rollout tracker',
    title: 'Site rollout manager for ~3,300 locations',
    short: 'A model-driven app in Dataverse to plan and track network upgrades store by store.',
    detail: [
      'Full data model under a custom publisher, Power Automate flows for status handling, and an Excel import from SharePoint to seed the locations.',
    ],
    stack: ['Dataverse', 'Model-driven apps', 'Power Automate'],
  },
  {
    id: 'assets',
    sector: 'Telecom',
    label: 'IT asset management',
    accent: 'magenta',
    title: 'IT asset management on Dataverse',
    short: 'Extended an asset-management solution and generated policy documents from related asset records.',
    detail: [
      'A Power Automate flow walks each asset policy and its "asset per policy" child rows to produce a document of categories, assets and quantities.',
      'Responded to a statement of work for full asset-lifecycle management (procurement, stock, deployment, return, Intune/Entra integration) by extending the existing solution instead of rebuilding.',
    ],
    stack: ['Dataverse', 'Power Automate', 'Entra ID'],
  },
  {
    id: 'sdm',
    sector: 'EU programmes',
    label: 'Contract & invoice tracking',
    title: 'Contract and invoicing database, normalised',
    short: 'Turned a macro-heavy Excel workbook of framework and specific contracts into a Dataverse app.',
    detail: [
      'Customers, contractors, delivery managers, contacts, framework contracts, specific contracts, invoices and penalties, with rollups from specific to framework contracts.',
      'Kept the simpler direct-lookup design over a proposed junction-table model to keep the app maintainable.',
    ],
    stack: ['Dataverse', 'Model-driven apps', 'Rollup fields'],
  },
  {
    id: 'takeover',
    sector: 'Hospitality',
    label: 'Hotel takeover planner',
    title: 'Hotel takeover planner',
    short: 'A Planner-style app for a fixed 30-day takeover procedure, with a drag-to-reschedule Gantt.',
    detail: [
      'Power Apps Code App on Dataverse for the admin; hotel staff without licences submit progress through a SharePoint form and library, bridged with Power Automate and an Azure Function.',
      'A single configurable template of sequential and conditional steps; moving a late task cascades through its dependents.',
      'A SharePoint site is provisioned per takeover through Graph.',
    ],
    stack: ['Code Apps', 'Dataverse', 'SharePoint Online', 'Azure Functions', 'Graph'],
  },
  {
    id: 'contract-alerts',
    sector: 'Public sector',
    label: 'Delivery document alerts',
    title: 'Document alerts for a public-sector contract',
    short: 'Flows that watch delivery folders, match project codes and keep the tracking workbook current.',
    detail: [
      'Keyword-triggered flows across several assignment folders, normalised matching between folder names and workbook rows (Greek/Latin lookalike characters included), row updates and Teams alerts to the responsible colleague.',
    ],
    stack: ['Power Automate', 'SharePoint Online', 'Excel Online', 'Teams'],
  },
];

// Products and side ventures. `shape` picks the 3D icon: ball, bars, dumbbell, wave, tee, kettlebell,
// engine or tag. `featured: true` puts the venture on the centre island instead of the ring.
export const ventures = [
  {
    id: 'hoops',
    title: 'HoopsTrivia',
    tagline: 'Basketball trivia for iOS',
    short: 'A React + Capacitor app on Supabase, 335 questions across five categories, nearing App Store submission.',
    detail: [
      'Moved from an Express proxy to direct PostgREST with row-level security; fixed answer-position bias in the question bank; built the waitlist site with Upstash rate limiting and Resend email.',
      'Next: EN/GR/FR/ES with domestic-league content and difficulty re-tiering.',
    ],
    links: [{ label: 'hoopstrivia.com', url: 'https://hoopstrivia.com' }, { label: 'Source', url: 'https://github.com/vasilistsonis/basketball-trivia' }],
    stack: ['React', 'Capacitor', 'Supabase'],
    shape: 'ball',
  },
  {
    id: 'roi',
    title: 'AI investment ROI engine',
    tagline: 'A deterministic finance engine with an AI interface',
    short: 'Parametric ROI/IRR for AI projects, deployed on Azure Container Apps with a React front end on Static Web Apps.',
    detail: [
      'The calculation engine is deterministic and grounded in standard finance methods; AI sits around it for input capture, narrative reports and what-if chat.',
      'Messy spreadsheets are mapped to structured scenarios by an LLM and reviewed before saving. CI/CD through GitHub Actions.',
    ],
    links: [],
    stack: ['Azure Container Apps', 'Azure Static Web Apps', 'React', 'Claude API'],
    shape: 'engine',
    featured: true, // sits on the centre island of the products scene
  },
  {
    id: 'coach',
    title: 'AI fitness & nutrition coach',
    tagline: 'A Telegram bot that remembers your programme',
    short: 'Daily check-ins on meals and training, a persisted workout plan and per-exercise progression tracking.',
    detail: ['Telegram front end, n8n orchestration, PostgreSQL and Azure OpenAI, all on one Azure VM with Docker Compose.'],
    links: [],
    stack: ['n8n', 'PostgreSQL', 'Azure OpenAI', 'Telegram'],
    shape: 'dumbbell',
  },
  {
    id: 'echo',
    title: 'Echo Sense',
    tagline: 'Voice analysis demo with a live-calling agent',
    short: 'An internal product demo: an ElevenLabs agent that calls the presenter while the transcript streams to the audience.',
    detail: ['Calling path designed as an ElevenLabs SIP trunk through Asterisk on the same VM as the AI stack.'],
    links: [],
    stack: ['ElevenLabs', 'Asterisk', 'Azure'],
    shape: 'wave',
  },
  {
    id: 'kartelfam',
    title: 'KartelFam',
    tagline: 'Streetwear store',
    short: 'WooCommerce store with a custom "Create your fit" outfit builder, mobile-first dark redesign and WooPayments.',
    detail: ['Custom PHP with skeleton loaders and staggered reveals; pre-launch caching audit of the shop page.'],
    links: [{ label: 'kartelfam.com', url: 'https://kartelfam.com' }],
    stack: ['WordPress', 'WooCommerce', 'PHP'],
    shape: 'tee',
  },
  {
    id: 'voreva',
    title: 'Voreva',
    tagline: 'Leggings brand, engineered to move',
    short: 'A standalone WooCommerce brand store on WoodMart, built for a gym client who wanted their own apparel line.',
    detail: [],
    links: [],
    stack: ['WordPress', 'WooCommerce'],
    shape: 'tee',
  },
  {
    id: 'stargym',
    title: 'Star Gym Athens',
    tagline: 'Gym site, Next.js on Vercel',
    short: 'Debugged stale-cache behaviour from ISR/SSG and a hard-coded fallback in the home page.',
    detail: [],
    links: [{ label: 'stargymathens.gr', url: 'https://stargymathens.gr' }],
    stack: ['Next.js', 'Vercel', 'Supabase'],
    shape: 'kettlebell',
  },
  {
    id: 'aphrodite',
    title: 'Residential sites',
    tagline: 'Aphrodite Residences, Fleming Residences, a law firm',
    short: 'Static and Next.js sites for real-estate developments on the Athenian Riviera and a bilingual law-firm site with appointment booking.',
    detail: [],
    links: [{ label: 'Aphrodite source', url: 'https://github.com/vasilistsonis/aphrodite-site' }, { label: 'Fleming source', url: 'https://github.com/vasilistsonis/flemingredinces' }],
    stack: ['Next.js', 'Static sites'],
    shape: 'tag',
  },
];

// Open-source and public repositories.
export const repos = [
  { id: 'medanatomy', name: 'medanatomy', title: 'MedAnatomy', short: 'Clinical anatomy study platform: cranial nerves, muscles, flashcards, quiz and search. Works offline, Supabase optional.', url: 'https://github.com/vasilistsonis/medanatomy', stack: ['Vite', 'Supabase'] },
  { id: 'onboarding', name: 'employee-onboarding', title: 'Employee onboarding portal', short: 'Enterprise onboarding lifecycle for joiners, HR, managers and IT, wired as a Power Apps Code App with a Gemini-backed assistant.', url: 'https://github.com/DCS-GH/employee-onboarding', stack: ['React', 'Code Apps', 'Gemini'] },
  { id: 'hoops-repo', name: 'basketball-trivia', title: 'HoopsTrivia app', short: 'The iOS trivia app: React, Capacitor and Supabase.', url: 'https://github.com/vasilistsonis/basketball-trivia', stack: ['React', 'Capacitor'] },
  { id: 'aphrodite-repo', name: 'aphrodite-site', title: 'Aphrodite Residences', short: 'Next.js site for a residential development in Voula, with per-apartment pages and generated OpenGraph images.', url: 'https://github.com/vasilistsonis/aphrodite-site', stack: ['Next.js'] },
  { id: 'fleming-repo', name: 'flemingredinces', title: 'Fleming Residences', short: 'Static site for a Glyfada development, built from the sales booklet.', url: 'https://github.com/vasilistsonis/flemingredinces', stack: ['HTML', 'CSS'] },
  { id: 'eshop', name: 'eShopOnWeb', title: 'eShopOnWeb', short: 'ASP.NET Core reference e-commerce app, used for .NET practice.', url: 'https://github.com/vasilistsonis/eShopOnWeb', stack: ['.NET'] },
];

// Private work kept in code-ownership repos (described, not linked).
export const privateRepos = [
  { id: 'plugins-repo', title: 'dataverse-plugins', short: 'Plugin library for Dataverse: approval logic, validation, record locking.' },
  { id: 'js-repo', title: 'd365-javascripts', short: 'Form scripts and ribbon commands for model-driven apps.' },
  { id: 'quotetrack', title: 'QuoteTrack', short: 'B2B supplier-quote manager in Next.js and Supabase: categories, comparison, PDF and Excel export.' },
  { id: 'travelbuddy', title: 'Travel Buddy', short: 'Expo app with AI itinerary generation and a multi-turn travel assistant.' },
];

// Certifications, Applied Skills and education. `code` is the bold label (and the medal label in 3D).
export const credentials = {
  certifications: [
    { code: 'DP-420', title: 'Azure Cosmos DB AI Developer Associate', note: 'Earned January 2025' },
    { code: 'PL-900', title: 'Power Platform Fundamentals', note: 'Earned April 2025' },
    { code: 'AZ-900', title: 'Azure Fundamentals', note: 'Earned November 2024' },
    { code: 'Copilot Studio', title: 'Applied Skills: Create agents in Microsoft Copilot Studio', note: 'Earned July 2026' },
    { code: 'Power Automate', title: 'Applied Skills: Create and manage automated processes', note: 'Earned September 2025' },
    { code: 'Canvas apps', title: 'Applied Skills: Create and manage canvas apps with Power Apps', note: 'Earned July 2025' },
  ],
  education: [
    { title: 'BSc Applied Informatics', org: 'University of Macedonia', note: 'Thessaloniki' },
  ],
};

// The journey the camera flies. Order matters.
export const sections = [
  { id: 'hero', label: 'Start', title: profile.name, body: profile.role, scroll: 1.2, linger: 0.5 },
  { id: 'platform', label: 'Platform', title: 'The stack I work in every day', body: 'Dataverse at the centre; everything else connects to it. Hover a skill to see where it was used.', scroll: 1.5, linger: 0.5 },
  { id: 'work', label: 'Client work', title: 'Eight engagements, eight sectors', body: 'Built as an external engineer for enterprise clients. Click a station for the case.', scroll: 1.8, linger: 0.55 },
  { id: 'ventures', label: 'Products', title: 'Things I shipped on my own', body: 'Apps, stores and AI tools, from idea to deployment.', scroll: 1.6, linger: 0.5 },
  { id: 'code', label: 'Open source', title: 'Code you can read', body: 'Public repositories, plus the private libraries I keep for continuity.', scroll: 1.3, linger: 0.45 },
  { id: 'credentials', label: 'Credentials', title: 'Certified on the platform', body: 'Three Microsoft certifications, three Applied Skills credentials and a degree in Applied Informatics.', scroll: 1.1, linger: 0.4 },
  { id: 'contact', label: 'Contact', title: 'Let\'s build something', body: 'Open to Power Platform and Dynamics 365 projects, product work and consulting.', scroll: 1.2, linger: 0.5 },
];
