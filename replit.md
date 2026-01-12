# Dark Magic - Mystical Fortune Telling Application

## Overview

Dark Magic is a mystical fortune-telling web application that provides AI-powered divination services. The platform offers five distinct mystical experiences: Tarot Reading, Fortune Ball, Vedic Kundali (birth chart), Numerology, and Shadow Search (dark magic queries). Each service uses OpenAI's API to generate personalized spiritual readings based on user input.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for mystical entrance effects and transitions
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a page-based structure where each divination type has its own page component. Shared UI components from shadcn/ui provide consistent styling with a dark, mystical theme using custom CSS variables.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints defined in `shared/routes.ts`
- **Validation**: Zod schemas shared between client and server for type safety

API routes handle divination requests by:
1. Validating input with Zod schemas
2. Sending prompts to OpenAI with mystical system prompts
3. Parsing JSON responses from the AI
4. Storing readings in the database
5. Returning formatted results to the client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**: 
  - `readings` - stores all divination results with type, input, and output as JSONB
  - `conversations` and `messages` - for chat functionality

Schema changes are applied using `npm run db:push` which runs Drizzle Kit migrations.

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database tables and Zod input schemas
- `routes.ts` - API route definitions with paths, methods, and response types

This ensures type safety across the full stack without duplication.

## External Dependencies

### AI Integration
- **Provider**: OpenAI API via Replit AI Integrations
- **Environment Variables**: 
  - `AI_INTEGRATIONS_OPENAI_API_KEY`
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Models Used**: gpt-5.1 for text, gpt-image-1 for image generation
- **Features**: JSON response format for structured divination results

### Database
- **Provider**: PostgreSQL (provisioned via Replit)
- **Connection**: `DATABASE_URL` environment variable
- **ORM**: Drizzle with node-postgres driver

### Third-Party Libraries
- **UI Components**: Radix UI primitives (dialogs, dropdowns, forms, etc.)
- **Date Handling**: date-fns for formatting birth dates
- **Utilities**: clsx and tailwind-merge for class name handling