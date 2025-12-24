# RedoraAI - Enterprise AI Marketing Intelligence Platform

## Overview

RedoraAI is a full-stack B2B SaaS platform designed to help marketers improve their visibility in AI search tools (ChatGPT, Gemini, Perplexity) and online communities (Reddit, Product Hunt, Discord). The application provides insights, content suggestions, and performance tracking through a modern, responsive dashboard interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Styling**: TailwindCSS with Shadcn/ui component library for consistent, professional UI
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and data fetching
- **Charts & Visualization**: Recharts for data visualization and analytics dashboards
- **Icons**: Lucide React for consistent iconography

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL storage

### Build & Development Tools
- **Build Tool**: Vite for fast development and optimized production builds
- **Bundler**: ESBuild for server-side bundling
- **Package Manager**: npm with lockfile for dependency management
- **Development**: Hot module replacement and runtime error overlay

## Key Components

### Frontend Structure
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui component library
│   │   ├── Layout.tsx      # Main application layout
│   │   ├── Navigation.tsx  # Top navigation bar
│   │   └── Sidebar.tsx     # Collapsible sidebar
│   ├── pages/              # Route-based page components
│   │   ├── Dashboard.tsx   # Main dashboard with metrics
│   │   ├── Analytics.tsx   # Deep analytics and insights
│   │   ├── ContentHub.tsx  # Content generation and management
│   │   ├── Integrations.tsx # Platform integrations
│   │   ├── Reports.tsx     # Report generation and exports
│   │   └── Settings.tsx    # User account and tracking preferences
│   ├── lib/                # Utility functions and configurations
│   └── hooks/              # Custom React hooks
```

### Backend Structure
```
server/
├── index.ts               # Express server entry point
├── routes.ts             # API route definitions
├── storage.ts            # Data access layer with memory storage
└── vite.ts              # Vite development server integration
```

### Shared Resources
```
shared/
└── schema.ts            # Database schema definitions with Drizzle
```

## Data Flow

### Frontend Data Management
1. **Query Client**: TanStack React Query manages all server state
2. **API Requests**: Centralized API request handling with error management
3. **Component State**: Local state for UI interactions and form management
4. **Mock Data**: Development uses dummy data for rapid prototyping

### Backend Data Flow
1. **Request Handling**: Express middleware for logging and error handling
2. **Storage Interface**: Abstracted storage layer supporting both memory and database storage
3. **Database Operations**: Drizzle ORM provides type-safe database queries
4. **Session Management**: Express sessions with PostgreSQL storage for user authentication

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **recharts**: Chart library for data visualization
- **wouter**: Lightweight routing library

### Development Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

### UI Component System
- **Shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite provides instant feedback during development
- **TypeScript Checking**: Full type checking across frontend and backend
- **Error Handling**: Runtime error overlay for debugging
- **Database**: Uses memory storage for rapid development iteration

### Production Build Process
1. **Frontend Build**: Vite compiles React application to static assets
2. **Backend Build**: ESBuild bundles server code for Node.js execution
3. **Database Migration**: Drizzle handles schema migrations to PostgreSQL
4. **Environment Variables**: DATABASE_URL required for production database connection

### Scalability Considerations
- **Database**: PostgreSQL with connection pooling for production workloads
- **Caching**: React Query provides intelligent client-side caching
- **Static Assets**: Vite optimizes and bundles frontend assets for CDN delivery
- **Session Storage**: PostgreSQL-backed sessions for horizontal scaling

## Changelog
```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Added Settings page with account management and tracked topics functionality
- July 14, 2025. Split Executive Dashboard and Analytics into two distinct views:
  - Executive Summary: High-level metrics for C-suite and marketing heads
  - Performance Insights: Deep-dive analytics for SEO specialists and content strategists
- July 14, 2025. Implemented comprehensive filtering system with export options
- July 14, 2025. Added keyword tracking with content brief generation capabilities
- July 14, 2025. Enhanced competitor comparison and channel performance analytics
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```