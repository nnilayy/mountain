# Mountains

## Overview

Mountains is a comprehensive outreach management platform designed to help recruiters and sales professionals track their email campaigns, manage company contacts, and analyze outreach performance. The application provides a complete solution for managing outreach workflows with features including company management, contact tracking, email analytics, and performance reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider supporting light, dark, and system themes with persistence

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Schema Validation**: Zod for runtime type validation and data parsing
- **Data Storage**: In-memory storage with mock data for development, designed for PostgreSQL in production

### Database Schema Design
The application uses three primary entities:
- **Companies**: Core entity tracking company information, outreach attempts, and engagement metrics
- **People**: Individual contacts within companies with their own outreach tracking
- **Email Stats**: Detailed tracking of individual email attempts with open/click metrics

### API Architecture
- **Pattern**: RESTful API design with consistent endpoint structure
- **Endpoints**: CRUD operations for companies, people, and email statistics
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Request validation using Zod schemas for data integrity

### Development Architecture
- **Monorepo Structure**: Shared schema definitions between frontend and backend
- **Hot Reload**: Vite development server with HMR for rapid development
- **Type Safety**: End-to-end TypeScript with shared types via the `shared` directory
- **Path Aliases**: Configured path mapping for clean imports (`@/`, `@shared/`)

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle Kit**: Database migrations and schema management
- **Connection**: Environment-based connection string configuration

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible component primitives
- **Lucide React**: Modern icon library for consistent iconography
- **Recharts**: Data visualization library for analytics charts and graphs

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **ESBuild**: Fast bundling for production server builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### State Management
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form state management with validation

### Authentication & Session Management
- **Connect PG Simple**: PostgreSQL session store integration
- **Express Session**: Server-side session management (configured but not actively used in current implementation)