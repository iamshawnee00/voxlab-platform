// ─────────────────────────────────────────────────────────────────────────────
// VOXLAB Service Catalog
// Add, edit, or remove entries here. Each service appears in the Quotation
// Builder so account managers can pick from them without typing from scratch.
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES = [
  'Video Production',
  'Performance Marketing',
  'Brand Strategy',
  'Social Media',
  'Creative & Design',
  'Retainer & Management',
  'Events & Activation',
];

export const SERVICE_CATALOG = [
  // ── Video Production ─────────────────────────────────────────────────────
  {
    id: 'svc-v01',
    category: 'Video Production',
    name: 'Brand Film — Full Production',
    description:
      'End-to-end brand film production including pre-production planning, concept development, professional filming crew, colour grading, sound design, and final delivery in broadcast-ready formats.',
    unit: 'Project',
    defaultPrice: 28000,
    sstExempt: false,
  },
  {
    id: 'svc-v02',
    category: 'Video Production',
    name: 'Short-Form Content (15–60s)',
    description:
      'Production of short-form video content optimised for social platforms (Instagram Reels, TikTok, YouTube Shorts). Includes concept, shoot, motion graphics, and platform-ready export.',
    unit: 'Per video',
    defaultPrice: 3500,
    sstExempt: false,
  },
  {
    id: 'svc-v03',
    category: 'Video Production',
    name: 'Product / Commercial Shoot',
    description:
      'Dedicated product photography and videography session. Includes studio or on-location setup, art direction, retouching, and delivery of raw + edited files.',
    unit: 'Per day',
    defaultPrice: 5500,
    sstExempt: false,
  },
  {
    id: 'svc-v04',
    category: 'Video Production',
    name: 'Motion Graphics & Animation',
    description:
      'Custom 2D/3D motion graphics, animated logos, lower thirds, and explainer animations tailored to brand guidelines.',
    unit: 'Per asset',
    defaultPrice: 2200,
    sstExempt: false,
  },
  {
    id: 'svc-v05',
    category: 'Video Production',
    name: 'Talking Head / Interview Production',
    description:
      'Professional multi-camera interview or testimonial video production. Includes lighting, teleprompter if required, colour grade, and subtitle overlay.',
    unit: 'Per session',
    defaultPrice: 4500,
    sstExempt: false,
  },

  // ── Performance Marketing ─────────────────────────────────────────────────
  {
    id: 'svc-p01',
    category: 'Performance Marketing',
    name: 'Meta Ads Management',
    description:
      'Full-funnel Meta (Facebook + Instagram) campaign management including audience research, creative briefing, campaign build, A/B testing, and monthly performance reporting.',
    unit: 'Monthly',
    defaultPrice: 2500,
    sstExempt: false,
  },
  {
    id: 'svc-p02',
    category: 'Performance Marketing',
    name: 'Google Ads Management',
    description:
      'Search, Display, and YouTube campaign management across Google Ads. Includes keyword strategy, bid management, landing page audit, and ROAS reporting.',
    unit: 'Monthly',
    defaultPrice: 2800,
    sstExempt: false,
  },
  {
    id: 'svc-p03',
    category: 'Performance Marketing',
    name: 'TikTok Ads Management',
    description:
      'TikTok campaign strategy and execution — Spark Ads, In-Feed Ads, TopView placement. Includes creative briefs, audience targeting, and performance optimisation.',
    unit: 'Monthly',
    defaultPrice: 2200,
    sstExempt: false,
  },
  {
    id: 'svc-p04',
    category: 'Performance Marketing',
    name: 'Performance Creative Assets',
    description:
      'Production of ad creative variants for performance campaigns — static, GIF, and short video formats. Includes copy, design, and platform specification compliance.',
    unit: 'Per batch (10 variants)',
    defaultPrice: 3800,
    sstExempt: false,
  },
  {
    id: 'svc-p05',
    category: 'Performance Marketing',
    name: 'Conversion Rate Optimisation (CRO) Audit',
    description:
      'In-depth landing page and funnel audit with heatmap analysis, UX recommendations, and A/B test planning to improve lead conversion rates.',
    unit: 'Project',
    defaultPrice: 4500,
    sstExempt: false,
  },

  // ── Brand Strategy ────────────────────────────────────────────────────────
  {
    id: 'svc-b01',
    category: 'Brand Strategy',
    name: 'Brand Identity Development',
    description:
      'Comprehensive brand identity package: brand positioning, visual identity system (logo suite, colour palette, typography), brand guidelines document, and asset library.',
    unit: 'Project',
    defaultPrice: 18000,
    sstExempt: false,
  },
  {
    id: 'svc-b02',
    category: 'Brand Strategy',
    name: 'Campaign Strategy & Concept',
    description:
      'Strategic campaign planning including audience persona mapping, key messaging framework, creative concept development, and channel strategy.',
    unit: 'Project',
    defaultPrice: 8500,
    sstExempt: false,
  },
  {
    id: 'svc-b03',
    category: 'Brand Strategy',
    name: 'Market & Competitor Research',
    description:
      'Structured research report covering market landscape, target audience insights, competitor benchmarking, and brand positioning recommendations.',
    unit: 'Project',
    defaultPrice: 5500,
    sstExempt: false,
  },

  // ── Social Media ──────────────────────────────────────────────────────────
  {
    id: 'svc-s01',
    category: 'Social Media',
    name: 'Social Media Management',
    description:
      'Monthly social media management across agreed platforms. Includes content calendar, copywriting, graphic design, scheduling, community management, and monthly analytics report.',
    unit: 'Monthly',
    defaultPrice: 3500,
    sstExempt: false,
  },
  {
    id: 'svc-s02',
    category: 'Social Media',
    name: 'Influencer Campaign Management',
    description:
      'End-to-end influencer campaign: talent identification, brief preparation, contract management, content approval, and post-campaign performance report.',
    unit: 'Campaign',
    defaultPrice: 6500,
    sstExempt: false,
  },
  {
    id: 'svc-s03',
    category: 'Social Media',
    name: 'Content Shoot (Photography)',
    description:
      'Social-first content photography session. Includes shot list planning, art direction, editing, and delivery of 20–30 platform-ready images.',
    unit: 'Per session',
    defaultPrice: 2800,
    sstExempt: false,
  },

  // ── Creative & Design ─────────────────────────────────────────────────────
  {
    id: 'svc-c01',
    category: 'Creative & Design',
    name: 'Pitch Deck / Presentation Design',
    description:
      'Professional presentation design (PowerPoint / Keynote / Google Slides) with custom layout, infographic creation, and brand-aligned visual treatment.',
    unit: 'Project',
    defaultPrice: 3200,
    sstExempt: false,
  },
  {
    id: 'svc-c02',
    category: 'Creative & Design',
    name: 'Copywriting (Campaign)',
    description:
      'Campaign copywriting across all agreed touchpoints — ads, landing pages, email sequences, and social captions. Delivered in brand voice with revisions.',
    unit: 'Project',
    defaultPrice: 2500,
    sstExempt: false,
  },

  // ── Retainer & Management ─────────────────────────────────────────────────
  {
    id: 'svc-r01',
    category: 'Retainer & Management',
    name: 'Monthly Account Retainer',
    description:
      'Dedicated account management retainer covering weekly check-ins, campaign oversight, reporting, and strategic advisory. Acts as an extension of your marketing team.',
    unit: 'Monthly',
    defaultPrice: 2000,
    sstExempt: false,
  },
  {
    id: 'svc-r02',
    category: 'Retainer & Management',
    name: 'Ad Spend Management Fee',
    description:
      'Management fee calculated as a percentage of total media/ad spend managed on behalf of the client. Covers bid optimisation, budget pacing, and platform oversight.',
    unit: '% of ad spend',
    defaultPrice: 0,
    sstExempt: false,
    note: 'Typically 10–15% of monthly ad spend. Enter negotiated amount as unit price.',
  },

  // ── Events & Activation ───────────────────────────────────────────────────
  {
    id: 'svc-e01',
    category: 'Events & Activation',
    name: 'Event Coverage & Livestream',
    description:
      'Multi-camera event coverage with real-time social content creation, post-event highlight video, and livestream setup if required.',
    unit: 'Per event',
    defaultPrice: 7500,
    sstExempt: false,
  },
  {
    id: 'svc-e02',
    category: 'Events & Activation',
    name: 'Pop-Up / Activation Production',
    description:
      'Creative concept and production management for brand pop-ups or experiential activations, including venue sourcing assistance, visual merchandising, and on-ground support.',
    unit: 'Project',
    defaultPrice: 12000,
    sstExempt: false,
  },
];
