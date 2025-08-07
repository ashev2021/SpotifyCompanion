# 🎵 Spotify AI Music Agent

A voice-activated AI music agent that combines intelligent conversation with real Spotify music discovery and playback. Built with React, TypeScript, Express.js, and OpenAI.

<img width="1897" height="926" alt="image" src="https://github.com/user-attachments/assets/c91aa3d0-4aec-41cd-a801-1dc5521a4fe1" />


## 🚀 Features

- **Voice-Activated Discovery**: Talk to the AI about your mood and get real music recommendations
- **Real Spotify Integration**: Search actual Spotify tracks and play 30-second previews
- **AI Conversation**: Natural language processing for music discovery
- **Preview Playback**: Listen to track previews before opening in Spotify
- **Mood-Based Recommendations**: AI analyzes your mood and finds matching music
- **Direct Spotify Links**: Open full tracks in Spotify app with one click

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Express.js + TypeScript
- **AI**: OpenAI GPT-4 for conversation and music analysis
- **Music**: Spotify Web API for real track data
- **Voice**: Web Speech API for recognition and synthesis
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with custom Spotify theming

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API key
- Spotify Developer Account (for Client ID and Secret)

## 🔧 Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spotify-ai-music-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   DATABASE_URL=your-database-url
   ```

4. **Get API Keys**
   
   **OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
   - Create a new secret key
   
   **Spotify API Keys:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add redirect URI: `http://localhost:5000/api/spotify/callback`
   - Copy Client ID and Client Secret

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

1. **Voice Commands**: Hold the microphone button and say things like:
   - "I want energetic music"
   - "Play something relaxing"
   - "Find happy songs for working"

2. **Text Input**: Type your music requests in the chat

3. **Music Discovery**: The AI will:
   - Analyze your mood and intent
   - Search Spotify for matching tracks
   - Play 30-second previews automatically
   - Provide links to open full tracks in Spotify

4. **Playback Controls**: 
   - Use the preview player for 30-second samples
   - Click "Open in Spotify" for full tracks
   - Browse recommended songs in the playlist

## 🏗️ Architecture

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
│   └── spotify.ts   # Spotify API integration
├── shared/          # Shared TypeScript types
└── components.json  # shadcn/ui configuration
```

## 🔒 Security Notes

- All API keys are stored as environment variables
- Client-side code never exposes secret keys
- Spotify integration uses Client Credentials flow (no user authentication required)
- HTTPS ready for production deployment

## 🚀 Deployment

The app is configured for easy deployment on platforms like Replit, Vercel, or Railway:

1. **Environment Variables**: Set the same environment variables on your hosting platform
2. **Database**: Configure PostgreSQL database URL
3. **Spotify Redirect**: Update Spotify app settings with your production URL
4. **Build**: Run `npm run build` for production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).


