# Church Accounting System

## Overview

A GitHub-based accounting system designed for church finances. This is a serverless application where all data (transactions, budgets, receipts) is stored directly in a GitHub repository rather than a traditional database. The frontend communicates with the GitHub API to perform CRUD operations on CSV files and images stored in the connected repository.

The application tracks income and expenses, manages budget categories, stores receipt images, and generates financial reports. It's designed with Korean language support for church accounting workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for GitHub connection state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Express.js on Node.js with TypeScript
- **Purpose**: Minimal server that primarily serves static files in production
- **Data Storage**: No traditional database - all data operations happen client-side via GitHub API
- **Build**: esbuild for server bundling, Vite for client bundling

### Data Storage Pattern
The application uses GitHub as its database:
- **Transactions**: Stored as CSV files in the repository
- **Settings/Budgets**: Stored as JSON files
- **Receipts**: Stored as images in a `/receipts` folder
- **Caching**: Local caching of transactions and settings to reduce API calls

### Key Design Decisions

1. **GitHub as Database**: Chose GitHub API for storage to avoid server costs and leverage version control for financial data. Trade-off: Requires GitHub token and has API rate limits.

2. **Client-Side Data Operations**: All CRUD operations happen in the browser via GitHub API (`client/src/lib/github.ts`). The server is stateless and only serves the SPA.

3. **CSV Format for Transactions**: Human-readable format that can be edited directly in GitHub if needed.

4. **Drizzle Configuration Present**: The project has Drizzle ORM configuration (`drizzle.config.ts`) and schema definitions (`shared/schema.ts`), but these are currently used only for Zod validation schemas, not database operations. PostgreSQL can be added later if needed.

### Application Structure
```
client/src/
├── pages/           # Route components (Dashboard, Input, History, Budget, Reports, Settings)
├── components/      # Shared components (Navigation, TransactionForm, ReceiptModal)
├── components/ui/   # shadcn/ui primitives
├── contexts/        # GitHubContext for connection state
├── lib/             # Utilities (github.ts, queryClient.ts)
└── hooks/           # Custom hooks

server/
├── index.ts         # Express app setup
├── routes.ts        # API routes (minimal)
├── static.ts        # Static file serving
└── storage.ts       # Empty storage interface (data lives in GitHub)

shared/
└── schema.ts        # Zod schemas for validation (transactions, budgets, settings)
```

## External Dependencies

### Third-Party Services
- **GitHub API**: Primary data storage backend. Requires personal access token with repo permissions. Configuration stored in browser localStorage.

### Key NPM Packages
- **@tanstack/react-query**: Data fetching and caching
- **react-hook-form** + **zod**: Form handling with validation
- **date-fns**: Date formatting and manipulation
- **wouter**: Client-side routing
- **Radix UI**: Accessible UI primitives (via shadcn/ui)
- **vaul**: Drawer component
- **embla-carousel-react**: Carousel functionality
- **cmdk**: Command menu component

### Database
- **PostgreSQL**: Configured via Drizzle but not actively used. The `DATABASE_URL` environment variable is referenced in `drizzle.config.ts` for potential future use.
- **connect-pg-simple**: Session store package present but sessions aren't implemented (stateless design).

### Fonts
- Inter (primary), DM Sans, Fira Code, Geist Mono - loaded from Google Fonts