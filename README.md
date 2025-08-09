# Multi-Game Lobby Platform

A modern, responsive lobby interface for multiple games built with React, TypeScript, and Tailwind CSS.

## Features

- **Multi-Game Support**: Switch between 8 different game types (Tactical Shooter, Battle Royale, MOBA, RTS, Racing, Fighting, Puzzle, RPG)
- **Party System**: Create and manage game parties with friends
- **Real-time Chat**: Integrated friends list and messaging system
- **Functional Settings**: Complete settings panel with audio, video, account, and appearance controls
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Dark theme with smooth animations and transitions

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd lobby-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Global styles
├── main.tsx         # Application entry point
└── vite-env.d.ts    # Vite type definitions
```

## Components

- **GameLobby**: Game selection and lobby management
- **PartyWidget**: Party management at the top of the screen
- **FriendsPanel**: Friends list and chat functionality
- **SettingsModal**: Comprehensive settings with persistence
- **GameView**: Game-specific display area
- **ProfileView**: User profile and match history

## Customization

### Adding New Games

Edit the `GAMES` constant in `App.tsx` to add new games:

```typescript
const GAMES = [
  {
    id: "new-game",
    name: "New Game",
    icon: "🎮",
    description: "Game description",
    modes: ["Mode 1", "Mode 2"],
  },
  // ... existing games
];
```

### Styling

The project uses Tailwind CSS. Modify styles by updating className props or extending the Tailwind configuration.

## License

MIT License - feel free to use this project for your own purposes.
