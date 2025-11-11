# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevLingo.com.br is a comprehensive Brazilian technical dictionary platform with over 15,000 technical terms in Portuguese. The project has two main components:

1. **Web Application**: A Next.js 15 application serving as a technical glossary for Brazilian developers
2. **AI Agents Collection**: 35+ specialized Claude Code agents organized by department for rapid development

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Required Environment Variables

```bash
FIREBASE_SERVICE_ACCOUNT_KEY=     # Firebase Admin SDK credentials (JSON string)
REDIS_URL=                        # Redis connection URL
MARITACA_API_KEY=                 # AI content enhancement API key
NEXT_PUBLIC_URL=                  # Base URL for the application
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Firebase Admin SDK, Redis for caching
- **AI Integration**: OpenAI/Maritaca AI for content enhancement
- **Email**: Resend for newsletter functionality

### Key API Routes

- `/api/v1/terms` - List all terms with pagination
- `/api/v1/term/[term]` - Get specific term details
- `/api/v1/category/[category]` - Get terms by category
- `/api/v1/enhance/[term]` - AI-powered term enhancement
- `/api/v1/categories` - List all available categories

### Data Flow
1. Terms stored in Firebase Firestore
2. Redis caches frequently accessed terms for performance
3. AI enhancement processes run asynchronously to improve content quality
4. Static generation for term pages ensures optimal SEO

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/v1/      # API endpoints
│   ├── termos/      # Term detail pages
│   └── categoria/   # Category pages
├── components/       # Reusable React components
│   ├── ui/          # Shadcn/ui components
│   └── bits/        # Custom animation components
└── lib/             # Utility functions and services
    ├── firebase.js  # Firebase configuration
    ├── redisClient.js # Redis client setup
    └── content.js   # Content processing utilities
```

## AI Agents Organization

The repository includes specialized agents in these departments:
- `engineering/` - Development and architecture agents
- `design/` - UI/UX and visual design agents
- `marketing/` - Growth and content creation agents
- `product/` - Feature prioritization and research agents
- `project-management/` - Coordination and shipping agents
- `studio-operations/` - Analytics and infrastructure agents
- `testing/` - Quality assurance and performance agents

## Content Enhancement System

The platform uses AI to enhance term definitions with:
- Structured sections (Overview, How it Works, Applications)
- Code examples with syntax highlighting
- FAQ sections for complex topics
- Related terms suggestions
- Technical level indicators

## SEO & Performance Considerations

- Dynamic sitemap generation at `/sitemap.js`
- OpenGraph image generation at `/api/og`
- Structured data (JSON-LD) for rich snippets
- Static generation for all term pages
- Redis caching for API responses

## Testing Approach

Currently, the project does not have a comprehensive test suite. When implementing tests:
- Use Jest for unit testing
- Consider React Testing Library for component tests
- Implement API endpoint testing
- Add performance benchmarks for Redis operations

## Deployment

The application is designed for Vercel deployment with:
- Automatic builds on push to main branch
- Environment variables configured in Vercel dashboard
- Edge functions for optimal performance
- CDN caching for static assets

## Common Development Tasks

### Adding a New Term
1. Terms are managed through Firebase
2. Use the admin panel at `/admin/enhanced` for content management
3. AI enhancement runs automatically for new terms

### Modifying UI Components
1. Check existing components in `src/components/`
2. Follow Tailwind CSS utility classes pattern
3. Use Framer Motion for animations
4. Maintain responsive design principles

### Working with AI Agents
1. Agents are defined in department folders as `.md` files
2. Each agent has YAML frontmatter with metadata
3. Agents can be invoked through Claude Code's Task tool
4. Proactive agents trigger automatically in specific contexts