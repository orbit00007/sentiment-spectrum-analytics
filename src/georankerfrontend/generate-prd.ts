import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import * as fs from "fs";

// Create the PRD document
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    children: [
      // Title
      new Paragraph({
        text: "Product Requirements Document (PRD)",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "RedoraAI - Enterprise AI Marketing Intelligence Platform",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Version: 1.0",
            bold: true,
          }),
          new TextRun({
            text: " | ",
          }),
          new TextRun({
            text: "Date: November 4, 2025",
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),

      // 1. Executive Summary
      new Paragraph({
        text: "1. Executive Summary",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "Product Overview",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "RedoraAI is a full-stack B2B SaaS platform designed to help marketers improve their visibility in AI search tools (ChatGPT, Gemini, Perplexity) and online communities (Reddit, Product Hunt, Discord). The application provides actionable insights, content suggestions, and performance tracking through a modern, responsive dashboard interface.",
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Problem Statement",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "As AI-powered search tools and online communities become primary sources of product discovery and research, traditional SEO strategies are becoming insufficient. Marketers lack visibility into how their brands perform in AI responses and community discussions, making it difficult to:",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "• Track brand mentions across AI platforms and online communities",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Understand sentiment and context of brand references",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Identify content gaps and competitive opportunities",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Measure share of voice against competitors in AI-generated responses",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Generate data-driven content strategies to improve AI visibility",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "Value Proposition",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "RedoraAI provides enterprise marketing teams with the first comprehensive platform to track, analyze, and optimize their presence in AI search results and online communities. By consolidating disparate data sources into actionable insights, RedoraAI enables marketers to make data-driven decisions about content strategy, competitive positioning, and brand visibility optimization.",
        spacing: { after: 200 },
      }),

      // 2. Objectives & Success Metrics
      new Paragraph({
        text: "2. Objectives & Success Metrics",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "Product Goals",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Provide real-time visibility into brand performance across AI platforms and online communities",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Enable data-driven content strategy through actionable insights and recommendations",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Reduce time-to-insight for marketing teams from weeks to minutes",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Streamline competitive intelligence gathering and analysis",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Automate content brief generation based on keyword gaps and opportunities",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "Key Performance Indicators (KPIs)",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• GEO Score (Generative Engine Optimization): Quantitative measure of brand visibility in AI responses",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Brand Mention Volume: Total mentions across tracked AI platforms",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Share of Voice: Percentage of category mentions compared to competitors",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Sentiment Score: Positive/negative ratio of brand mentions",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Content Gap Coverage: Number of identified opportunities addressed",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• User Engagement: Daily active users, session duration, feature adoption rate",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 3. Target Audience & User Personas
      new Paragraph({
        text: "3. Target Audience & User Personas",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "Primary Persona 1: C-Suite Executive / Marketing VP",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Goals: ", bold: true }),
          new TextRun({ text: "Quick overview of brand health, ROI justification for marketing spend, competitive positioning at a glance" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Needs: ", bold: true }),
          new TextRun({ text: "High-level metrics, executive summary dashboards, exportable reports for board presentations" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Pain Points: ", bold: true }),
          new TextRun({ text: "Information overload, lack of actionable insights, difficulty proving marketing impact" }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: "Primary Persona 2: Marketing Manager / Marketing Head",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Goals: ", bold: true }),
          new TextRun({ text: "Optimize content strategy, track campaign performance, identify growth opportunities" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Needs: ", bold: true }),
          new TextRun({ text: "Balanced view of metrics and insights, trend analysis, content recommendations" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Pain Points: ", bold: true }),
          new TextRun({ text: "Fragmented data sources, manual competitive analysis, slow content approval cycles" }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: "Primary Persona 3: SEO Specialist / Content Strategist",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Goals: ", bold: true }),
          new TextRun({ text: "Deep-dive analytics, keyword research, content optimization, technical SEO for AI platforms" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Needs: ", bold: true }),
          new TextRun({ text: "Granular data, filtering and segmentation, keyword tracking, competitor comparison, content briefs" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Pain Points: ", bold: true }),
          new TextRun({ text: "Limited AI search visibility tools, time-consuming manual analysis, difficulty proving content ROI" }),
        ],
        spacing: { after: 200 },
      }),

      // 4. Product Features & Requirements
      new Paragraph({
        text: "4. Product Features & Requirements",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "4.1 Executive Summary Dashboard",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Purpose: ", bold: true }),
          new TextRun({ text: "Provide C-suite and marketing heads with high-level brand health metrics at a glance" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Key Features:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• GEO Score with trend indicator (up/down/flat)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Brand Mentions across top 3 LLMs (ChatGPT, Gemini, Perplexity)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Share of Voice visualization with competitor comparison",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Content Gap & Competitive Opportunity Cards highlighting immediate actions",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Platform Presence Summary (Reddit, Product Hunt, Medium, Wikipedia, GitHub)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Visibility Progress Tracker showing improvement over time",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "4.2 Performance Insights (Analytics)",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Purpose: ", bold: true }),
          new TextRun({ text: "Enable SEO specialists and content strategists to perform deep-dive analysis and optimization" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Key Features:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• Comprehensive filtering panel (LLM, Content Type, Channel, Time Range)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• CSV/PDF export options for reports and presentations",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Model-wise Prompt Share visualization (pie chart)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Sentiment Trends over time with filtering capabilities",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Keyword Gains & Losses sortable table with impact indicators",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Inline 'Create Content Brief' actions from missed keywords",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Prompt Volume Over Time with annotated events",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Channel Performance Breakdown (Reddit, Product Hunt, Discord, etc.)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Competitor Comparison Table with share of voice metrics",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "4.3 Content Hub",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Purpose: ", bold: true }),
          new TextRun({ text: "Centralize content planning and brief generation based on insights" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Key Features:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• Automated content brief generation from keyword gaps",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Content calendar with tracking and status updates",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Recommended topics based on competitive analysis",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Performance tracking for published content",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "4.4 Integrations",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Purpose: ", bold: true }),
          new TextRun({ text: "Connect to external data sources and platforms for comprehensive tracking" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Key Features:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• AI Platform APIs (ChatGPT, Gemini, Perplexity, Claude)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Community Platforms (Reddit API, Product Hunt, Discord)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Content Platforms (Medium, GitHub, Wikipedia monitoring)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Analytics Export (Google Analytics, Mixpanel integration)",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "4.5 Reports",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Purpose: ", bold: true }),
          new TextRun({ text: "Generate and schedule automated reports for stakeholders" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Key Features:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• Automated weekly/monthly executive summaries",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Custom report builder with drag-and-drop widgets",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Scheduled email delivery to stakeholders",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• PDF/PowerPoint export options",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "4.6 Settings",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Purpose: ", bold: true }),
          new TextRun({ text: "Manage user account, tracked keywords, and platform configurations" }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Key Features:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• User profile and account management",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Tracked keywords and topics configuration",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Competitor tracking setup",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Alert and notification preferences",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• API key management for integrations",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 5. Technical Architecture
      new Paragraph({
        text: "5. Technical Architecture & Stack",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "5.1 Frontend Architecture",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Framework: React 18 with TypeScript for type safety and modern development practices",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Styling: TailwindCSS with Shadcn/ui component library for consistent, professional UI",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Routing: Wouter for lightweight client-side routing",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• State Management: TanStack React Query for server state management and data fetching",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Charts & Visualization: Recharts for data visualization and analytics dashboards",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Icons: Lucide React for consistent iconography",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "5.2 Backend Architecture",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Runtime: Node.js with Express.js framework",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Language: TypeScript for full-stack type safety",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Database: PostgreSQL with Drizzle ORM for type-safe database operations",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Database Provider: Neon Database (serverless PostgreSQL)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Session Management: Express sessions with PostgreSQL storage",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "5.3 Build & Development Tools",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Build Tool: Vite for fast development and optimized production builds",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Bundler: ESBuild for server-side bundling",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Package Manager: npm with lockfile for dependency management",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Development: Hot module replacement and runtime error overlay",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "5.4 Core Dependencies",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• @neondatabase/serverless - Serverless PostgreSQL database connectivity",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• drizzle-orm - Type-safe database ORM with PostgreSQL support",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• @tanstack/react-query - Server state management and caching",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• @radix-ui/* - Headless UI components for accessibility",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• recharts - Chart library for data visualization",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• wouter - Lightweight routing library",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "5.5 Data Architecture",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "Frontend Data Management:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• Query Client: TanStack React Query manages all server state",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• API Requests: Centralized API request handling with error management",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Component State: Local state for UI interactions and form management",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Mock Data: Development uses dummy data for rapid prototyping",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "Backend Data Flow:",
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: "• Request Handling: Express middleware for logging and error handling",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Storage Interface: Abstracted storage layer supporting both memory and database storage",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Database Operations: Drizzle ORM provides type-safe database queries",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Session Management: Express sessions with PostgreSQL storage for user authentication",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 6. Non-Functional Requirements
      new Paragraph({
        text: "6. Non-Functional Requirements",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "6.1 Performance",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Page load time < 2 seconds for dashboard views",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• API response time < 500ms for 95th percentile requests",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Support 1000+ concurrent users without degradation",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Real-time data updates within 5 minutes of source changes",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "6.2 Security",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• SOC 2 Type II compliance for enterprise customers",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• End-to-end encryption for sensitive data in transit and at rest",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Role-based access control (RBAC) for team accounts",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• API key encryption and secure storage",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Regular security audits and penetration testing",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "6.3 Scalability",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• PostgreSQL with connection pooling for production workloads",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• React Query provides intelligent client-side caching",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Vite optimizes and bundles frontend assets for CDN delivery",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• PostgreSQL-backed sessions for horizontal scaling",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Microservices architecture for independent scaling of components",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "6.4 Reliability",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• 99.9% uptime SLA for production environment",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Automated backup and disaster recovery procedures",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Graceful degradation when external APIs are unavailable",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Error monitoring and alerting for critical failures",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 7. User Stories & Use Cases
      new Paragraph({
        text: "7. User Stories & Use Cases",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "7.1 Executive User Stories",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 1: ", bold: true }),
          new TextRun({ text: "As a CMO, I want to see our brand's overall visibility score so that I can quickly assess marketing effectiveness and report to the board." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 2: ", bold: true }),
          new TextRun({ text: "As a VP of Marketing, I want to compare our share of voice against competitors so that I can identify areas where we're losing ground and prioritize investments." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 3: ", bold: true }),
          new TextRun({ text: "As an executive, I want to export high-level reports as PDFs so that I can include them in board presentations and stakeholder updates." }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: "7.2 Marketing Manager User Stories",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 1: ", bold: true }),
          new TextRun({ text: "As a Marketing Manager, I want to identify content gaps where competitors are gaining mentions so that I can create targeted content to reclaim market share." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 2: ", bold: true }),
          new TextRun({ text: "As a Marketing Manager, I want to track sentiment trends over time so that I can measure the impact of our messaging and PR campaigns." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 3: ", bold: true }),
          new TextRun({ text: "As a Marketing Manager, I want to monitor our presence across online communities so that I can ensure we're active in the right channels." }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: "7.3 SEO Specialist User Stories",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 1: ", bold: true }),
          new TextRun({ text: "As an SEO Specialist, I want to filter analytics by specific AI models and time ranges so that I can analyze performance trends and optimize for each platform." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 2: ", bold: true }),
          new TextRun({ text: "As an SEO Specialist, I want to see keyword gains and losses with impact scores so that I can prioritize content optimization efforts." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 3: ", bold: true }),
          new TextRun({ text: "As an SEO Specialist, I want to generate content briefs from keyword gaps so that I can quickly create SEO-optimized content without manual research." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Story 4: ", bold: true }),
          new TextRun({ text: "As an SEO Specialist, I want to export detailed analytics as CSV so that I can perform custom analysis in Excel or Google Sheets." }),
        ],
        spacing: { after: 200 },
      }),

      // 8. Roadmap & Timeline
      new Paragraph({
        text: "8. Product Roadmap & Timeline",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "Phase 1: MVP Launch (Completed - July 2025)",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Executive Summary dashboard with GEO Score and key metrics",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Performance Insights with comprehensive filtering",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Content Hub with brief generation capabilities",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Settings page with keyword tracking",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Basic integrations setup",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Report generation and export functionality",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "Phase 2: Data Integration (Q4 2025)",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Live API integrations with ChatGPT, Gemini, Perplexity",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Reddit, Product Hunt, and Discord API connections",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Real-time data ingestion and processing pipeline",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Automated sentiment analysis using NLP",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Database migration from memory to PostgreSQL",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "Phase 3: Advanced Features (Q1 2026)",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• AI-powered content recommendations",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Competitor tracking automation",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Custom alert system for significant changes",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Advanced report builder with custom templates",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Team collaboration features (commenting, sharing)",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "Phase 4: Enterprise Features (Q2 2026)",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Multi-brand management capabilities",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Role-based access control (RBAC)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• White-label reporting for agencies",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• API access for custom integrations",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• SOC 2 compliance certification",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Dedicated account management",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 9. Design & User Experience
      new Paragraph({
        text: "9. Design & User Experience",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "9.1 Design Principles",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Clarity: Information presented in scannable, hierarchical format",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Efficiency: Reduce clicks and time-to-insight for all user personas",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Consistency: Unified design language across all pages and components",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Accessibility: WCAG 2.1 AA compliance for inclusive design",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Responsiveness: Optimized experience on desktop, tablet, and mobile devices",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "9.2 Visual Hierarchy",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Color-coded indicators: Green (growth), Red (decline), Yellow (watch), Blue (neutral)",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Typography: Clear hierarchy with heading levels and consistent font sizing",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Whitespace: Generous spacing to reduce cognitive load and improve readability",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Icons: Consistent use of Lucide React icons for visual cues and actions",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "9.3 Interaction Patterns",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Hover states: Visual feedback for interactive elements",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Loading states: Skeleton screens and spinners during data fetching",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Tooltips: Contextual help for complex metrics and terminology",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Inline editing: Streamlined workflows for common tasks",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Toast notifications: Non-intrusive feedback for user actions",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 10. Open Questions & Assumptions
      new Paragraph({
        text: "10. Open Questions & Assumptions",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: "10.1 Open Questions",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• API Rate Limits: What are the practical limits for polling AI platform APIs?",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Data Retention: How long should historical data be retained (90 days, 1 year, unlimited)?",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Pricing Model: Should we use per-seat, usage-based, or tiered pricing?",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Content Brief Format: What level of detail should automated briefs include?",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Competitor Tracking: Should users manually add competitors or auto-detect from industry?",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "10.2 Key Assumptions",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "• Users have basic understanding of SEO and marketing metrics",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• AI platform APIs will remain accessible and provide consistent data",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Enterprise customers will pay premium for advanced features and white-labeling",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• GEO (Generative Engine Optimization) will become a standard marketing metric",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Users prefer all-in-one dashboard over multiple specialized tools",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // 11. Change History
      new Paragraph({
        text: "11. Change History",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: "Version 1.0 - November 4, 2025",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• Initial PRD creation",
        spacing: { after: 50 },
        bullet: { level: 1 },
      }),
      new Paragraph({
        text: "• July 1, 2025: Initial platform setup and architecture",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• July 1, 2025: Added Settings page with account management and tracked topics",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• July 14, 2025: Split Executive Dashboard and Analytics into distinct views",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• July 14, 2025: Implemented comprehensive filtering system with export options",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• July 14, 2025: Added keyword tracking with content brief generation",
        spacing: { after: 50 },
        bullet: { level: 0 },
      }),
      new Paragraph({
        text: "• July 14, 2025: Enhanced competitor comparison and channel performance analytics",
        spacing: { after: 200 },
        bullet: { level: 0 },
      }),

      // Appendix
      new Paragraph({
        text: "Appendix A: Glossary",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "GEO Score (Generative Engine Optimization): ", bold: true }),
          new TextRun({ text: "A proprietary metric measuring brand visibility in AI-generated responses across multiple platforms." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Share of Voice: ", bold: true }),
          new TextRun({ text: "Percentage of brand mentions relative to total category mentions, including competitors." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Content Brief: ", bold: true }),
          new TextRun({ text: "Automated document outlining topic, keywords, structure, and SEO requirements for content creation." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Sentiment Analysis: ", bold: true }),
          new TextRun({ text: "NLP-based classification of brand mentions as positive, negative, or neutral." }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "LLM (Large Language Model): ", bold: true }),
          new TextRun({ text: "AI systems like ChatGPT, Gemini, and Claude that generate human-like text responses." }),
        ],
        spacing: { after: 400 },
      }),

      // Footer
      new Paragraph({
        text: "End of Document",
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }),
      new Paragraph({
        text: "For questions or feedback, please contact the Product Team",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ],
  }],
});

// Generate and save the document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("RedoraAI-PRD.docx", buffer);
  console.log("✅ PRD document generated successfully: RedoraAI-PRD.docx");
  console.log("📄 You can now download the file from the file explorer");
});
