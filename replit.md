# Spotify AI Music Agent

## Overview

This is a full-stack voice-powered music recommendation application that uses AI to analyze user conversations and provide personalized music recommendations. The application features a React frontend with shadcn/ui components and an Express backend with OpenAI integration, all built with TypeScript and modern web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Spotify-themed color variables
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite for fast development and building

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **AI Integration**: OpenAI API for conversation analysis and music recommendations
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: In-memory storage with fallback to PostgreSQL
- **Development**: Hot reload with Vite middleware integration

### Key Components

#### Voice Processing System
- **Speech Recognition**: Web Speech API integration for voice input
- **Speech Synthesis**: Web Speech API for AI responses
- **Real-time Processing**: Voice wave visualizations and status indicators
- **Voice Commands**: Intent recognition and command processing

#### AI Music Recommendation Engine
- **Mood Analysis**: OpenAI GPT-4 analyzes user messages for mood and energy levels
- **Contextual Responses**: Generates conversational responses about music recommendations
- **Personalization**: Tracks user preferences and conversation history
- **Biometric Integration**: Simulated heart rate and emotion scoring

#### UI Components
- **Conversation Panel**: Real-time chat interface with voice/text input
- **Music Player**: Now playing interface with audio controls
- **Mood Visualization**: Real-time mood analysis display
- **Biometric Dashboard**: Health metrics integration
- **Voice Overlay**: Modal interface for voice interactions

## Data Flow

1. **User Input**: Voice or text input captured through React components
2. **Frontend Processing**: Speech recognition converts voice to text
3. **API Request**: Message sent to Express backend via React Query
4. **AI Analysis**: OpenAI processes message for mood, intent, and recommendations
5. **Database Storage**: Conversations and recommendations stored in PostgreSQL
6. **Response Generation**: AI generates conversational response
7. **Frontend Update**: UI updates with recommendations and analysis
8. **Voice Output**: Optional speech synthesis for AI responses

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4 for natural language processing and music recommendations
- **Web Speech API**: Browser-native speech recognition and synthesis

### Database
- **Neon Database**: PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and migrations

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Animation library for smooth transitions

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Drizzle push for schema synchronization

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Migrations applied via Drizzle Kit
- **Environment**: Node.js production server

### Configuration
- **Environment Variables**: 
  - `DATABASE_URL`: PostgreSQL connection string
  - `OPENAI_API_KEY`: OpenAI API authentication
  - `NODE_ENV`: Environment mode (development/production)

### File Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and API client
│   │   └── pages/       # Route components
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API route definitions
│   └── storage.ts   # Database abstraction layer
├── shared/          # Shared TypeScript types and schemas
└── migrations/      # Database migration files
```

The application uses a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The database schema is defined using Drizzle ORM with automatic type generation for full-stack type safety.