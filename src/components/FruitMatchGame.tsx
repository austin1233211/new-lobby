import { useEffect, useRef } from 'react';

interface FruitMatchGameProps {
  playerName?: string;
  onGameEnd?: () => void;
}

export function FruitMatchGame({ playerName = "Player", onGameEnd }: FruitMatchGameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'gameEnded') {
        onGameEnd?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameEnd]);

  const gameUrl = process.env.NODE_ENV === 'development' 
    ? `http://localhost:3001?playerName=${encodeURIComponent(playerName)}&points=100`
    : `https://your-game-server.com?playerName=${encodeURIComponent(playerName)}&points=100`;

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={gameUrl}
        className="w-full h-full border-0 rounded-lg"
        title="Fruit Matching Game"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
