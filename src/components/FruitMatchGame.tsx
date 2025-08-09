interface FruitMatchGameProps {
  playerName?: string;
  points?: number;
}

export function FruitMatchGame({ playerName = "Player", points = 100 }: FruitMatchGameProps) {
  const playFruitMatching = () => {
    const gameUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:3001?playerName=${encodeURIComponent(playerName)}&points=${points}`
      : `https://your-game-server.com?playerName=${encodeURIComponent(playerName)}&points=${points}`;
    
    window.open(gameUrl, '_blank');
  };

  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-900">
      <div className="text-center">
        <div className="mb-4 text-4xl">🍎</div>
        <div className="mb-2 text-xl font-semibold text-zinc-100">Fruit Matching</div>
        <div className="mb-4 text-sm text-zinc-400">Match 3+ fruits to score points</div>
        <button 
          onClick={playFruitMatching}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Play Game
        </button>
      </div>
    </div>
  );
}
