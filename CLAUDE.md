# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Society Games Helper is a French web application that provides AI-powered board game recommendations based on user mood analysis using natural language processing. The project has two backend implementations:

1. **Basic System** (`backend/server.js`): Simple mood analysis with 10 games
2. **Advanced System** (`backend/advancedServer.js`): Sophisticated NLP with 20+ games and detailed scoring

The frontend (`frontend-advanced/`) is designed to work with both backend systems but is optimized for the advanced system.

## Development Commands

### Backend (Node.js/Express)
```bash
# Basic backend (port 3001)
cd backend
npm install
npm start                    # Basic server
node advancedServer.js       # Advanced server

# Using convenience scripts
./start-advanced.sh         # Starts advanced server with setup
./test-system.sh            # Run system tests
```

### Frontend (React/TypeScript)
```bash
# Frontend (port 3000)
cd frontend-advanced
npm install
npm start
npm test
npm run build

# Using convenience script
./start-frontend.sh         # Starts frontend with setup
```

### Full System Development
```bash
# Terminal 1: Backend
cd backend && ./start-advanced.sh

# Terminal 2: Frontend  
cd frontend-advanced && npm start

# Access: http://localhost:3000 (frontend talks to backend on :3001)
```

## Architecture

### Backend Architecture
- **Port**: 3001 (both basic and advanced servers)
- **Database**: SQLite in-memory with JSON backup (`games_data.json`)
- **NLP**: Natural.js library for tokenization and analysis
- **Key Files**:
  - `server.js`: Basic recommendation server
  - `advancedServer.js`: Advanced server with sophisticated mood analysis
  - `advancedDatabase.js`: Database layer with 20+ games
  - `advancedMoodAnalyzer.js`: NLP engine with synonym dictionary and complex expressions
  - `games_data.json`: Game database backup

### Frontend Architecture
- **Port**: 3000
- **Stack**: React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Key Components**:
  - `MoodAnalyzer`: Main mood input component
  - `GameCard`/`GameModal`: Game display components
  - `Library`: Personal game library management
  - `AllGames`: Browse all available games
  - `StartPage`: Landing page with statistics
- **Services**: API service layer, library service for local storage

### API Endpoints (Advanced System)
- `POST /api/recommend/advanced`: Main recommendation endpoint
- `POST /api/analyze/mood`: Mood analysis only
- `GET /api/games`: List all games
- `GET /api/stats`: Database statistics
- `GET /api/games/type/:type`: Games by type
- `GET /api/search/tags`: Search by tags

## Key Features

### Mood Analysis System
The advanced system uses a sophisticated NLP approach:
- **Synonym Dictionary**: 40+ expressions with synonyms
- **Complex Expressions**: Regex patterns for natural language phrases
- **Scoring Algorithm**: Weighted compatibility scoring across 8 criteria
- **Confidence Scoring**: 0-100% confidence in mood analysis

### Game Recommendation
Games are scored based on:
- Energy level match (×15 weight)
- Social interaction level (×15 weight)  
- Duration compatibility (×20 weight)
- Player count match (×15 weight)
- Complexity preference (×10 weight)
- Mood tag matches (×10 weight)

### Database Structure
Each game has 30+ fields including:
- Basic info (name, description, players, duration, complexity)
- Mood ratings (1-5 scale): energy_requise, niveau_social, facteur_chance, tension_niveau, etc.
- Natural language tags for mood matching
- Mechanics, themes, and categorization

## Testing

The system includes test scripts in `backend/`:
- `test-system.sh`: System integration tests
- `test_coverage.js`: Game coverage analysis
- `test_library_search.js`: Library search functionality tests

## Development Notes

### Adding New Games
1. Edit `games_data.json` with complete game data
2. Ensure all mood ratings (1-5) are filled
3. Add relevant `tags_mood` for natural language matching
4. Restart the server to reload data

### Extending Mood Analysis
- Add synonyms to `synonymDictionary` in `advancedMoodAnalyzer.js`
- Create regex patterns in `expressionsComplexes` for phrase matching
- Adjust scoring weights in `calculateGameCompatibility()`

### Code Style
- French language for user-facing content and comments
- English for technical variable names
- TypeScript strict mode in frontend
- Express.js best practices in backend

## File Organization
```
society-games-helper/
├── backend/                 # Node.js backend
│   ├── server.js           # Basic server
│   ├── advancedServer.js   # Advanced server  
│   ├── advancedDatabase.js # Database layer
│   ├── advancedMoodAnalyzer.js # NLP engine
│   └── games_data.json     # Game database
├── frontend-advanced/      # React frontend with Tailwind
│   ├── src/components/     # React components
│   ├── src/services/       # API and library services
│   └── src/types/          # TypeScript definitions
└── *.md                   # Documentation files
```

The advanced system (`frontend-advanced` + `advancedServer.js`) is the recommended version for development, offering superior mood analysis and user experience.