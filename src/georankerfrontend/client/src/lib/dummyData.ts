export const dummyMetrics = {
  trackedTopics: 8,
  searchAppearances: 247,
  shareOfVoice: 34
};

export const aiSearchKeywords = [
  { keyword: "AI Marketing Tools", rank: 7 },
  { keyword: "Marketing Automation", rank: 12 },
  { keyword: "Content Generation", rank: 15 },
  { keyword: "B2B Marketing Solutions", rank: 23 }
];

export const mentionsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Mentions',
    data: [45, 52, 48, 61, 55, 67],
    borderColor: 'hsl(160, 60%, 45%)',
    backgroundColor: 'hsla(160, 60%, 45%, 0.1)',
    tension: 0.4
  }]
};

export const contentVisibilityData = [
  { 
    contentType: "Blog",
    specificContent: "AI Marketing ROI: Complete Guide 2024",
    aiSearchAppearances: 3, 
    communityMentions: 12,
    aiDetails: [
      { platform: "ChatGPT", mentions: 2, keywords: ["AI marketing ROI", "marketing automation"] },
      { platform: "Perplexity", mentions: 1, keywords: ["B2B marketing metrics"] }
    ],
    communityDetails: [
      { platform: "Reddit", mentions: 8, discussions: ["r/marketing", "r/entrepreneur"] },
      { platform: "LinkedIn", mentions: 3, discussions: ["Marketing professionals group"] },
      { platform: "Quora", mentions: 1, discussions: ["Marketing measurement"] }
    ]
  },
  { 
    contentType: "Blog",
    specificContent: "Marketing Automation Best Practices",
    aiSearchAppearances: 0, 
    communityMentions: 4,
    aiDetails: [],
    communityDetails: [
      { platform: "Reddit", mentions: 3, discussions: ["r/MarketingAutomation"] },
      { platform: "Discord", mentions: 1, discussions: ["Marketing tech community"] }
    ]
  },
  { 
    contentType: "Reddit Post",
    specificContent: "Why AI tools are changing B2B marketing",
    aiSearchAppearances: 1, 
    communityMentions: 22,
    aiDetails: [
      { platform: "ChatGPT", mentions: 1, keywords: ["B2B AI tools"] }
    ],
    communityDetails: [
      { platform: "Reddit", mentions: 18, discussions: ["r/marketing", "r/SaaS", "r/entrepreneur"] },
      { platform: "Product Hunt", mentions: 4, discussions: ["AI tool discussions"] }
    ]
  },
  { 
    contentType: "LinkedIn Post",
    specificContent: "5 ways AI is transforming lead generation",
    aiSearchAppearances: 0, 
    communityMentions: 5,
    aiDetails: [],
    communityDetails: [
      { platform: "LinkedIn", mentions: 5, discussions: ["Sales professionals network"] }
    ]
  }
];

export const suggestedActions = [
  {
    icon: "lightbulb",
    title: "Create \"AI Marketing ROI\" content",
    description: "High search volume, low competition detected",
    color: "blue"
  },
  {
    icon: "message-circle",
    title: "Engage in r/MarketingAutomation",
    description: "3 relevant discussions trending now",
    color: "emerald"
  },
  {
    icon: "trending-up",
    title: "Optimize for \"content automation\"",
    description: "Competitor gaining traction in this keyword",
    color: "amber"
  }
];

export const aiSearchTable = [
  {
    keyword: "AI Marketing Tools",
    platform: "ChatGPT",
    brandMentions: 3,
    competitorMentions: "HubSpot (8), Salesforce (12)"
  },
  {
    keyword: "Marketing Automation", 
    platform: "Gemini",
    brandMentions: 1,
    competitorMentions: "Marketo (6), Pardot (4)"
  },
  {
    keyword: "Content Generation",
    platform: "Perplexity", 
    brandMentions: 0,
    competitorMentions: "Copy.ai (15), Jasper (23)"
  },
  {
    keyword: "B2B Marketing Solutions",
    platform: "ChatGPT",
    brandMentions: 2,
    competitorMentions: "HubSpot (5), Pardot (3)"
  }
];

export const platformMentionsData = {
  labels: ['Reddit', 'LinkedIn', 'Product Hunt', 'Discord', 'Quora'],
  datasets: [{
    data: [22, 5, 0, 3, 9],
    backgroundColor: [
      'hsl(207, 90%, 54%)',
      'hsl(160, 60%, 45%)',
      'hsl(271, 91%, 65%)',
      'hsl(0, 84%, 60%)',
      'hsl(43, 74%, 66%)'
    ]
  }]
};

export const communityMetrics = {
  totalConversations: 89,
  totalMentions: 39,
  platforms: {
    reddit: { conversations: 47, mentions: 22 },
    linkedin: { conversations: 12, mentions: 5 },
    productHunt: { conversations: 8, mentions: 0 },
    discord: { conversations: 15, mentions: 3 },
    quora: { conversations: 7, mentions: 9 }
  }
};

export const sentimentData = {
  labels: ['Positive', 'Neutral', 'Negative'],
  datasets: [{
    data: [67, 28, 5],
    backgroundColor: ['hsl(160, 60%, 45%)', 'hsl(214, 13%, 47%)', 'hsl(0, 84%, 60%)']
  }]
};

export const shareOfVoiceData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'RedoraAI',
      data: [6, 8, 4, 6],
      borderColor: 'hsl(207, 90%, 54%)',
      backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
      tension: 0.4
    },
    {
      label: 'HubSpot',
      data: [18, 21, 19, 20],
      borderColor: 'hsl(0, 84%, 60%)',
      backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
      tension: 0.4
    },
    {
      label: 'Salesforce',
      data: [25, 29, 27, 31],
      borderColor: 'hsl(160, 60%, 45%)',
      backgroundColor: 'hsla(160, 60%, 45%, 0.1)',
      tension: 0.4
    }
  ]
};

export const trendingConversations = [
  {
    snippet: "Looking for the best AI marketing tool that actually works for small businesses...",
    platform: "Reddit",
    sentiment: "Positive",
    action: "Engage"
  },
  {
    snippet: "Has anyone tried RedoraAI for content automation? Curious about results...",
    platform: "Product Hunt",
    sentiment: "Neutral",
    action: "Respond"
  }
];

export const contentIdeas = [
  {
    title: "ROI of AI Marketing: A Complete Guide",
    description: "High search volume, medium competition",
    type: "Blog Post",
    color: "blue"
  },
  {
    title: "Why I switched to AI-powered marketing",
    description: "Trending in r/marketing community",
    type: "Reddit Post",
    color: "emerald"
  },
  {
    title: "5 AI tools transforming B2B marketing",
    description: "Perfect for LinkedIn engagement",
    type: "LinkedIn",
    color: "purple"
  }
];

export const engagementOpportunities = [
  {
    title: "Best AI marketing tools for 2024?",
    platform: "r/MarketingAutomation",
    time: "2 hours ago",
    comments: "47 comments",
    relevance: "High Relevance"
  },
  {
    title: "Struggling with content automation",
    platform: "Product Hunt",
    time: "5 hours ago",
    comments: "23 comments",
    relevance: "Medium Relevance"
  }
];

export const contentPerformanceTracking = [
  {
    title: "AI Marketing Trends 2024",
    platform: "LinkedIn",
    type: "Blog Post",
    performance: "+156%",
    stats: "847 views, 23 shares"
  },
  {
    title: "Marketing automation tips",
    platform: "Reddit",
    type: "Comment",
    performance: "+12%",
    stats: "234 upvotes, 45 replies"
  }
];

export const integrations = [
  {
    name: "Reddit",
    description: "Monitor discussions and engage with communities",
    icon: "message-circle",
    status: "Connected",
    color: "orange"
  },
  {
    name: "Product Hunt",
    description: "Track product launches and community feedback",
    icon: "hash",
    status: "Not Connected",
    color: "orange"
  },
  {
    name: "LinkedIn",
    description: "Professional network content performance",
    icon: "linkedin",
    status: "Connected",
    color: "blue"
  },
  {
    name: "Discord",
    description: "Monitor tech and marketing communities",
    icon: "message-square",
    status: "Not Connected",
    color: "purple"
  },
  {
    name: "Quora",
    description: "Track questions and provide expert answers",
    icon: "help-circle",
    status: "Not Connected",
    color: "red"
  },
  {
    name: "Google Analytics",
    description: "Website traffic and conversion tracking",
    icon: "trending-up",
    status: "Connected",
    color: "gray"
  }
];

export const reports = [
  {
    title: "AI Search Report",
    description: "Comprehensive analysis of your AI search visibility across ChatGPT, Gemini, and Perplexity",
    icon: "search",
    color: "blue",
    lastUpdated: "Today"
  },
  {
    title: "Community Mentions Summary",
    description: "Detailed breakdown of mentions across Reddit, Product Hunt, Discord, and other communities",
    icon: "users",
    color: "emerald",
    lastUpdated: "2 hours ago"
  },
  {
    title: "Competitor Benchmark",
    description: "In-depth comparison with key competitors including share of voice and content gaps",
    icon: "eye",
    color: "purple",
    lastUpdated: "Yesterday"
  },
  {
    title: "Content Action Plan",
    description: "AI-generated suggestions for content creation, optimization, and engagement strategies",
    icon: "lightbulb",
    color: "amber",
    lastUpdated: "Today"
  }
];

// New data for expanded functionality
export const contentStrategyPlans = [
  {
    id: 1,
    title: "AI Marketing ROI Series",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    status: "Active",
    contentTypes: ["Blog", "LinkedIn", "Case Study"],
    trackedTopics: ["AI Marketing", "ROI Measurement", "Marketing Automation"],
    plannedPosts: 8,
    completedPosts: 3
  },
  {
    id: 2,
    title: "Product Launch Campaign",
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    status: "Planning",
    contentTypes: ["Blog", "Reddit", "Product Hunt"],
    trackedTopics: ["Product Launch", "SaaS Marketing", "User Acquisition"],
    plannedPosts: 12,
    completedPosts: 0
  }
];

export const contentPlannerCalendar = [
  {
    date: "2024-02-05",
    content: "AI Marketing ROI: Complete Guide 2024",
    type: "Blog",
    goal: "Rank",
    status: "Published",
    optimizedFor: "ChatGPT"
  },
  {
    date: "2024-02-08",
    content: "Why ROI tracking matters for AI tools",
    type: "LinkedIn",
    goal: "Engage",
    status: "Scheduled",
    optimizedFor: "Perplexity"
  },
  {
    date: "2024-02-12",
    content: "B2B Marketing Automation Case Study",
    type: "Case Study",
    goal: "Convert",
    status: "Draft",
    optimizedFor: "ChatGPT"
  }
];

export const contentBriefs = [
  {
    id: 1,
    title: "AI Marketing ROI: Complete Guide 2024",
    headlines: [
      "The Ultimate Guide to AI Marketing ROI in 2024",
      "How to Measure ROI from AI Marketing Tools",
      "AI Marketing ROI: What Every B2B Marketer Needs to Know"
    ],
    idealLength: "2500-3000 words",
    format: {
      h1: "Main title with primary keyword",
      h2s: ["What is AI Marketing ROI?", "How to Calculate ROI", "Best Practices", "Common Pitfalls", "Tools & Resources"],
      cta: "Try our AI ROI calculator"
    },
    llmOptimization: {
      platform: "ChatGPT",
      prompt: "Write for conversational AI queries about marketing ROI measurement"
    }
  }
];

export const caseStudyDiscovery = [
  {
    id: 1,
    keyword: "AI marketing automation",
    source: "hubspot.com",
    title: "How HubSpot Increased Lead Generation by 300% with AI",
    context: "Customer success story featuring AI-powered lead scoring",
    quotes: ["AI helped us identify high-intent prospects 3x faster"],
    relevanceScore: 95,
    lastUpdated: "2024-01-15"
  },
  {
    id: 2,
    keyword: "B2B content marketing",
    source: "salesforce.com",
    title: "Salesforce Trailhead: Scaling Content with AI",
    context: "Case study about AI-powered content personalization",
    quotes: ["Personalized content drove 40% more engagement"],
    relevanceScore: 88,
    lastUpdated: "2024-01-20"
  }
];

export const seoGaps = [
  {
    cluster: "AI Marketing Tools",
    yourRank: null,
    topCompetitors: ["marketo.com", "hubspot.com", "salesforce.com"],
    opportunity: "High",
    searchVolume: 8900,
    difficulty: "Medium",
    suggestedAction: "Create comprehensive comparison guide"
  },
  {
    cluster: "Marketing Automation ROI",
    yourRank: 15,
    topCompetitors: ["pardot.com", "marketo.com"],
    opportunity: "Medium",
    searchVolume: 2400,
    difficulty: "Low",
    suggestedAction: "Update existing content with recent data"
  }
];

export const brandAuditData = {
  wikipedia: { present: false, action: "Create Wikipedia page" },
  linkedin: { present: true, engagement: "87% above average", action: "Maintain current strategy" },
  github: { present: true, stars: 2834, action: "Promote open source projects" },
  productHunt: { present: false, action: "Submit latest product updates" },
  reddit: { present: true, mentions: 45, sentiment: "Positive", action: "Engage in top discussions" },
  discord: { present: true, communities: 3, action: "Expand community presence" }
};

export const outcomeInsights = {
  leadGeneration: {
    increase: 42,
    description: "Qualified leads from AI search visibility"
  },
  websiteTraffic: {
    increase: 28,
    description: "Organic traffic from content mentions"
  },
  brandAwareness: {
    increase: 65,
    description: "Brand mention growth across platforms"
  },
  conversionRate: 3.2,
  customerAcquisitionCost: 245,
  averageDealSize: 12500,
  salesCycleLength: 45,
  current: {
    searchAppearances: 247,
    communityMentions: 89,
    shareOfVoice: 34
  },
  previous: {
    searchAppearances: 198,
    communityMentions: 67,
    shareOfVoice: 28
  },
  target: {
    searchAppearances: 350,
    communityMentions: 150,
    shareOfVoice: 45
  },
  contentCreated: 12,
  visibilityDelta: "+24.7%"
};
