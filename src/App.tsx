import { useState, useEffect, useRef } from "react";
import {
  Users,
  Play,
  Settings,
  User,
  Bell,
  LogOut,
  Plus,
  Search,
  Send,
  MoreVertical,
  Shield,
  X,
  Check,
  Circle,
  Moon,
  Sun,
  Volume2,
  Monitor,
  LayoutGrid,
  Gamepad2,
} from "lucide-react";
import './App.css'
import { FruitMatchGame } from './components/FruitMatchGame';

/**
 * LoL-style Lobby System (single-file demo)
 *
 * ✅ Fix: removed attempt to load "@/components/ui" (shadcn) which fails in this sandbox.
 *    We now rely 100% on the Tailwind-based primitives below.
 *
 * Layout
 * - Left Nav: Home, Play, Profile, Settings
 * - Center: tabs for Play Queue, Party, Game Placeholder, News
 * - Right: Friends list + per-friend chat
 * - Top bar: Search, Notifications, Profile menu
 * - Modals: Settings, Invite Friends
 * - Mock state only; wire to backend later
 */

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const STATUS_BADGE = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-zinc-500",
};

(function runSelfTests() {
  try {
    console.assert(clsx("a", false, "b") === "a b", "clsx should join truthy strings");
    console.assert(Object.keys(STATUS_BADGE).length === 3, "STATUS_BADGE map should have 3 statuses");
    console.log("%cLobby self-tests passed", "color:#22c55e");
  } catch (e) {
    console.error("Lobby self-tests failed", e);
  }
})();

const GAMES = [
  { 
    id: "fps", 
    name: "Tactical Shooter", 
    icon: "🎯", 
    description: "5v5 tactical FPS",
    modes: ["Competitive", "Casual", "Deathmatch"],
    maps: ["Dust Valley", "Industrial", "Cityscape"]
  },
  { 
    id: "battle-royale", 
    name: "Battle Royale", 
    icon: "🏆", 
    description: "100-player survival",
    modes: ["Solo", "Duo", "Squad"],
    maps: ["Storm Island", "Desert Wasteland"]
  },
  { 
    id: "moba", 
    name: "MOBA", 
    icon: "⚔️", 
    description: "5v5 strategic battles",
    modes: ["Ranked", "Normal", "ARAM"],
    maps: ["Summoner's Rift", "Howling Abyss"]
  },
  { 
    id: "rts", 
    name: "Real-Time Strategy", 
    icon: "🏰", 
    description: "Build and conquer",
    modes: ["1v1", "2v2", "Campaign"],
    maps: ["Ancient Ruins", "Frozen Tundra"]
  },
  { 
    id: "racing", 
    name: "Racing", 
    icon: "🏎️", 
    description: "High-speed racing",
    modes: ["Circuit", "Time Trial", "Drift"],
    maps: ["Monaco", "Nurburgring", "Tokyo"]
  },
  { 
    id: "fighting", 
    name: "Fighting", 
    icon: "🥊", 
    description: "1v1 combat",
    modes: ["Arcade", "Tournament", "Training"],
    maps: ["Dojo", "Street", "Arena"]
  },
  { 
    id: "puzzle", 
    name: "Puzzle", 
    icon: "🧩", 
    description: "Brain teasers",
    modes: ["Classic", "Timed", "Endless"],
    maps: ["Garden", "Space", "Underwater"]
  },
  { 
    id: "rpg", 
    name: "RPG", 
    icon: "🗡️", 
    description: "Role-playing adventure",
    modes: ["Story", "Co-op", "PvP"],
    maps: ["Forest", "Dungeon", "Castle"]
  },
  { 
    id: "fruit-match", 
    name: "Fruit Matching", 
    icon: "🍎", 
    description: "Match 3+ fruits to score points",
    modes: ["Competitive", "Practice"],
    maps: ["Classic Board", "Obstacle Course"]
  }
];

const MOCK_NEWS = [
  {
    id: "n1",
    title: "Patch 12.7 — Support Items Rework",
    excerpt: "Gold flow and warding trinkets adjusted. Expect slower lane snowballs.",
    time: "2h ago",
  },
  {
    id: "n2",
    title: "New Map Variant: Nightfall Rift",
    excerpt: "Dynamic fog-of-war pockets arrive in rotating queues this weekend.",
    time: "1d ago",
  },
  {
    id: "n3",
    title: "Ranked Split Ends Aug 31",
    excerpt: "Climb now to secure your split emote and banner trims.",
    time: "3d ago",
  },
];

const MOCK_FRIENDS = [
  { id: "f1", name: "Aki", status: "online", game: "Tactical Shooter", avatar: "🦊" },
  { id: "f2", name: "Noah", status: "away", game: "Battle Royale", avatar: "🐼" },
  { id: "f3", name: "Maya", status: "online", game: "MOBA", avatar: "🐱" },
  { id: "f4", name: "Rin", status: "offline", game: "—", avatar: "🐧" },
  { id: "f5", name: "Leo", status: "online", game: "RTS", avatar: "🐯" },
];

function timeNow() {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "now";
  }
}

const Button = ({ className, children, variant = "primary", ...props }) => (
  <button
    className={clsx(
      "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2",
      variant === "primary" && "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-400",
      variant === "ghost" && "hover:bg-zinc-800/50 text-zinc-200",
      variant === "outline" && "border border-zinc-700 hover:bg-zinc-800/60 text-zinc-200",
      variant === "danger" && "bg-rose-600 hover:bg-rose-500 text-white",
      variant === "success" && "bg-emerald-600 hover:bg-emerald-500 text-white",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={clsx(
      "w-full rounded-xl bg-zinc-900/60 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
    {...props}
  />
);

const Card = ({ className, children, ...props }) => (
  <div className={clsx("rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl", className)} {...props}>
    {children}
  </div>
);

const Avatar = ({ label, size = 36, status }) => (
  <div className="relative inline-flex">
    <div
      className="grid place-items-center rounded-full bg-zinc-800 border border-zinc-700 text-lg"
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      <span className="select-none">{label}</span>
    </div>
    {status && (
      <span className={clsx("absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-zinc-900", STATUS_BADGE[status])} />
    )}
  </div>
);

const ChatBubble = ({ me, text, time }) => (
  <div className={clsx("flex w-full", me ? "justify-end" : "justify-start")}>
    <div
      className={clsx(
        "max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
        me ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-100"
      )}
    >
      <div>{text}</div>
      {time && (
        <div className={clsx("mt-1 text-[10px]", me ? "text-indigo-200/80" : "text-zinc-400")}>{time}</div>
      )}
    </div>
  </div>
);

function FriendsPanel({ friends, activeFriendId, onSelectFriend, chats, onSend, onInvite }) {
  const [filter, setFilter] = useState("");
  const active = friends.find((f) => f.id === activeFriendId) ?? null;
  const list = friends.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()));
  const [message, setMessage] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <Search size={18} className="text-zinc-400" />
        <Input className="" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search friends" />
      </div>

      <Card className="flex-1 overflow-hidden p-0">
        <div className="grid h-full grid-cols-5">
          {/* Friend list */}
          <div className="col-span-2 border-r border-zinc-800">
            <div className="max-h-[58vh] overflow-y-auto">
              {list.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onSelectFriend(f.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 px-3 py-3 hover:bg-zinc-800/70",
                    activeFriendId === f.id && "bg-zinc-800/90"
                  )}
                >
                  <Avatar label={f.avatar} status={f.status} />
                  <div className="flex min-w-0 flex-col text-left">
                    <div className="truncate text-sm text-zinc-100">{f.name}</div>
                    <div className="truncate text-xs text-zinc-400">{f.game}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className={clsx("h-2 w-2 rounded-full", STATUS_BADGE[f.status])} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <div className="col-span-3 flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-zinc-800 p-3">
              {active ? (
                <>
                  <Avatar label={active.avatar} status={active.status} />
                  <div className="flex flex-col">
                    <div className="text-sm text-zinc-100">{active.name}</div>
                    <div className="text-xs text-zinc-400">
                      {active.status === "offline" ? "Offline" : active.game}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button className="" variant="outline" onClick={() => onInvite(active.id)}>
                      <Plus size={16} />Invite
                    </Button>
                    <Button className="" variant="ghost">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-zinc-400">Select a friend to chat</div>
              )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {active && (chats[active.id] ?? []).map((m, i) => (
                <ChatBubble key={i} me={m.fromMe} text={m.text} time={m.time} />
              ))}
              <div ref={endRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-zinc-800 p-3">
              <Input
                className=""
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={active ? `Message ${active.name}` : "Select a friend to start chatting"}
                disabled={!active}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && active && message.trim()) {
                    onSend(active.id, message.trim());
                    setMessage("");
                  }
                }}
              />
              <Button
                className=""
                onClick={() => {
                  if (active && message.trim()) {
                    onSend(active.id, message.trim());
                    setMessage("");
                  }
                }}
                disabled={!active || !message.trim()}
              >
                <Send size={16} /> Send
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="text-[11px] text-zinc-500">
        Tip: Right-click friends (long-press on mobile) for quick actions in a real app.
      </div>
    </div>
  );
}

function PartyWidget({ friends, onInviteFriend, party, onAddMember }) {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-200">
          <Users size={18} /> Party
        </div>
        <div className="flex items-center gap-4">
          {party.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <Avatar label={p.avatar} status="online" />
              <div className="flex flex-col">
                <div className="text-sm text-zinc-100">{p.name}</div>
                <div className="text-xs text-zinc-400">{p.role}</div>
              </div>
              {p.role === "Leader" ? (
                <span className="rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-400">
                  Leader
                </span>
              ) : (
                <Button className="" variant="ghost">
                  <X size={14} />
                </Button>
              )}
            </div>
          ))}
          <InviteFriend
            friends={friends}
            onInvite={(id) => {
              onAddMember(id);
              onInviteFriend(id);
            }}
          />
        </div>
      </div>
    </Card>
  );
}

function GameLobby({ selectedGame, onGameChange, games }) {
  const [selectedMode, setSelectedMode] = useState(0);
  const [isReady, setReady] = useState(false);

  const currentGame = games.find(g => g.id === selectedGame);

  return (
    <Card className="">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-300">
          <Shield size={18} /> Game Lobby
        </div>
        <div className="text-xs text-zinc-400">Region: Auto • Est. 2–4 min</div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-3 bg-zinc-900/80">
          <div className="mb-2 flex items-center gap-2 text-zinc-200">
            <Gamepad2 size={18} /> Select Game
          </div>
          <div className="grid grid-cols-4 gap-2">
            {games.map((game) => (
              <Button 
                key={game.id}
                className="flex flex-col items-center gap-1 h-16"
                variant={selectedGame === game.id ? "success" : "ghost"} 
                onClick={() => onGameChange(game.id)}
              >
                <span className="text-lg">{game.icon}</span>
                <span className="text-xs">{game.name}</span>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-900/80">
          <div className="mb-2 text-zinc-200">Mode</div>
          <div className="grid grid-cols-1 gap-2">
            {currentGame.modes.map((mode, index) => (
              <Button 
                key={mode} 
                className="text-xs"
                variant={selectedMode === index ? "outline" : "ghost"}
                onClick={() => setSelectedMode(index)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-900/50 p-3">
        <div className="flex items-center gap-3">
          <Button className="" variant={isReady ? "success" : "outline"} onClick={() => setReady((v) => !v)}>
            {isReady ? <Check size={16} /> : <Circle size={16} />} {isReady ? "Ready" : "Not Ready"}
          </Button>
          <div className="text-sm text-zinc-300">All party members must ready up.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="" variant="primary">
            <Play size={16} /> Find Match
          </Button>
          <Button className="" variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}

function InviteFriend({ friends, onInvite }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const matches = friends.filter(
    (f) => f.status !== "offline" && f.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
        <Plus size={16} /> Invite Friends
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal>
          <Card className="w-full max-w-md">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-zinc-100">Invite Friends</div>
              <Button className="" variant="ghost" onClick={() => setOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            <Input className="" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search online friends" />
            <div className="mt-3 max-h-[40vh] space-y-2 overflow-y-auto">
              {matches.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl bg-zinc-900/60 p-2">
                  <Avatar label={m.avatar} status={m.status} />
                  <div className="flex flex-col">
                    <div className="text-sm text-zinc-100">{m.name}</div>
                    <div className="text-xs text-zinc-400">{m.game}</div>
                  </div>
                  <div className="ml-auto">
                    <Button
                      onClick={() => {
                        onInvite(m.id);
                        setOpen(false);
                      }}
                      className=""
                    >
                      <Plus size={16} /> Invite
                    </Button>
                  </div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="text-sm text-zinc-400">No online friends found</div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function GameView({ selectedGame, games }) {
  const currentGame = games.find(g => g.id === selectedGame);
  
  if (selectedGame === "fruit-match") {
    return (
      <Card className="h-[380px] w-full overflow-hidden">
        <FruitMatchGame 
          playerName="Player1" 
          points={100}
        />
      </Card>
    );
  }
  
  return (
    <Card className="h-[380px] w-full overflow-hidden">
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="mb-4 text-4xl">{currentGame.icon}</div>
          <div className="mb-2 text-xl font-semibold text-zinc-100">{currentGame.name}</div>
          <div className="text-sm text-zinc-400">{currentGame.description}</div>
          <div className="mt-4 text-xs text-zinc-500">Game view placeholder - integrate your {currentGame.name} here</div>
        </div>
      </div>
    </Card>
  );
}

function SettingsModal({ open, onClose }) {
  const [dark, setDark] = useState(true);
  const [music, setMusic] = useState(70);
  const [sfx, setSfx] = useState(80);
  const [voice, setVoice] = useState(65);
  const [displayMode, setDisplayMode] = useState("Windowed");
  const [fpsLimit, setFpsLimit] = useState("60");
  const [region, setRegion] = useState("JP");
  const [displayName, setDisplayName] = useState("Kayden");
  const [tagline, setTagline] = useState("#JP");
  const [compactUI, setCompactUI] = useState(false);
  const [muteUnfocused, setMuteUnfocused] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoAcceptParty, setAutoAcceptParty] = useState(false);
  const [showFPS, setShowFPS] = useState(false);
  const [vsync, setVsync] = useState(true);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", dark);
    } catch (error) {
      console.warn("Failed to toggle dark mode:", error);
    }
  }, [dark]);

  const handleSave = () => {
    const settings = {
      dark, music, sfx, voice, displayMode, fpsLimit, region, 
      displayName, tagline, compactUI, muteUnfocused, notifications,
      autoAcceptParty, showFPS, vsync
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    
    const originalText = document.querySelector('[data-save-btn]')?.textContent;
    const saveBtn = document.querySelector('[data-save-btn]');
    if (saveBtn) {
      saveBtn.textContent = '✓ Saved!';
      setTimeout(() => {
        if (saveBtn) saveBtn.textContent = originalText || 'Save';
      }, 1500);
    }
    
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal>
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100">
            <Settings size={18} /> Settings
          </div>
          <Button className="" variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="">
            <div className="mb-2 flex items-center gap-2 text-zinc-200">
              <Monitor size={18} /> Video
            </div>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Display Mode</span>
                <select 
                  value={displayMode}
                  onChange={(e) => setDisplayMode(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                >
                  <option>Windowed</option>
                  <option>Borderless</option>
                  <option>Fullscreen</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>FPS Limit</span>
                <select 
                  value={fpsLimit}
                  onChange={(e) => setFpsLimit(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                >
                  <option>30</option>
                  <option>60</option>
                  <option>120</option>
                  <option>144</option>
                  <option>240</option>
                  <option>Unlimited</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>V-Sync</span>
                <input 
                  type="checkbox" 
                  checked={vsync}
                  onChange={(e) => setVsync(e.target.checked)}
                  className="h-4 w-4" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show FPS Counter</span>
                <input 
                  type="checkbox" 
                  checked={showFPS}
                  onChange={(e) => setShowFPS(e.target.checked)}
                  className="h-4 w-4" 
                />
              </div>
            </div>
          </Card>

          <Card className="">
            <div className="mb-2 flex items-center gap-2 text-zinc-200">
              <Volume2 size={18} /> Audio
            </div>
            <div className="space-y-3 text-sm text-zinc-300">
              {[
                ["Master", music, setMusic],
                ["SFX", sfx, setSfx],
                ["Voice", voice, setVoice],
              ].map(([label, value, setter]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <div className="w-16 text-zinc-400">{label as string}</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value as number}
                    onChange={(e) => (setter as (value: number) => void)(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="w-8 text-right text-zinc-400">{value as number}</div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span>Mute when unfocused</span>
                <input 
                  type="checkbox" 
                  checked={muteUnfocused}
                  onChange={(e) => setMuteUnfocused(e.target.checked)}
                  className="h-4 w-4" 
                />
              </div>
            </div>
          </Card>

          <Card className="">
            <div className="mb-2 flex items-center gap-2 text-zinc-200">
              <User size={18} /> Account
            </div>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Region</span>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
                >
                  <option>JP</option>
                  <option>NA</option>
                  <option>EUW</option>
                  <option>EUNE</option>
                  <option>KR</option>
                  <option>OCE</option>
                  <option>BR</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-zinc-400">Display Name</div>
                <Input 
                  className="" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-zinc-400">Tagline</div>
                <Input 
                  className="" 
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="">
            <div className="mb-2 flex items-center gap-2 text-zinc-200">
              <Moon size={18} /> Appearance
            </div>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <Button className="" variant="outline" onClick={() => setDark((v) => !v)}>
                  {dark ? (
                    <>
                      <Moon size={16} /> Dark
                    </>
                  ) : (
                    <>
                      <Sun size={16} /> Light
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Compact UI</span>
                <input 
                  type="checkbox" 
                  checked={compactUI}
                  onChange={(e) => setCompactUI(e.target.checked)}
                  className="h-4 w-4" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-4 w-4" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-accept party invites</span>
                <input 
                  type="checkbox" 
                  checked={autoAcceptParty}
                  onChange={(e) => setAutoAcceptParty(e.target.checked)}
                  className="h-4 w-4" 
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-4 flex justify-between">
          <Button 
            className="" 
            variant="ghost" 
            onClick={() => {
              setDark(true);
              setMusic(70);
              setSfx(80);
              setVoice(65);
              setDisplayMode("Windowed");
              setFpsLimit("60");
              setRegion("JP");
              setDisplayName("Kayden");
              setTagline("#JP");
              setCompactUI(false);
              setMuteUnfocused(false);
              setNotifications(true);
              setAutoAcceptParty(false);
              setShowFPS(false);
              setVsync(true);
            }}
          >
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button className="" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="" variant="primary" onClick={handleSave} data-save-btn>
              <Check size={16} /> Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-1">
        <div className="flex items-center gap-3">
          <Avatar label="🦁" status="online" size={56} />
          <div className="flex flex-col">
            <div className="text-lg text-zinc-100">Kayden</div>
            <div className="text-sm text-zinc-400">#JP • Level 42</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <Card className="bg-zinc-900/70 py-3">
            <div className="text-zinc-400">Wins</div>
            <div className="text-zinc-100">128</div>
          </Card>
          <Card className="bg-zinc-900/70 py-3">
            <div className="text-zinc-400">Losses</div>
            <div className="text-zinc-100">111</div>
          </Card>
          <Card className="bg-zinc-900/70 py-3">
            <div className="text-zinc-400">WR</div>
            <div className="text-zinc-100">53%</div>
          </Card>
        </div>
      </Card>

      <Card className="col-span-2">
        <div className="mb-2 text-zinc-200">Recent Matches</div>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-zinc-900/60 p-2">
              <div className="text-zinc-400">#{1024 + i}</div>
              <div className="text-zinc-100">{i % 2 ? "Win" : "Loss"}</div>
              <div className="text-zinc-400 text-xs">KDA {(Math.random() * 4 + 1).toFixed(1)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewsPanel() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {MOCK_NEWS.map((n) => (
        <Card key={n.id} className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/40">
          <div className="text-sm font-medium text-zinc-100">{n.title}</div>
          <div className="mt-1 text-sm text-zinc-400">{n.excerpt}</div>
          <div className="mt-3 text-xs text-zinc-500">{n.time}</div>
        </Card>
      ))}
    </div>
  );
}

function TopBar({ onOpenSettings }) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-800 p-3">
      <div className="text-lg font-semibold text-zinc-100">GameHub</div>
      <div className="ml-2 hidden items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-sm text-zinc-400 md:flex">
        <Search size={16} />
        <input className="bg-transparent outline-none" placeholder="Search players, matches, news..." />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button className="" variant="ghost" aria-label="notifications">
          <Bell size={18} />
        </Button>
        <div className="h-5 w-px bg-zinc-800" />
        <Button className="" variant="outline" onClick={onOpenSettings}>
          <Settings size={16} /> Settings
        </Button>
        <Button className="" variant="ghost">
          <LogOut size={16} /> Logout
        </Button>
      </div>
    </div>
  );
}

function LeftNav({ current, setCurrent }) {
  const items = [
    { id: "home", label: "Home", icon: <LayoutGrid size={18} /> },
    { id: "play", label: "Play", icon: <Play size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setCurrent(it.id)}
          className={clsx(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-800/60",
            current === it.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-300"
          )}
        >
          {it.icon}
          <span>{it.label}</span>
        </button>
      ))}
      <div className="mt-auto text-[11px] text-zinc-500">v0.1 demo</div>
    </div>
  );
}

export default function App() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0].id);
  const [tab, setTab] = useState("play");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [friends] = useState(MOCK_FRIENDS);
  const [activeFriendId, setActiveFriendId] = useState(friends[0].id);
  const [party, setParty] = useState([
    { id: "me", name: "You", role: "Leader", avatar: "🦁" },
  ]);
  const [chats, setChats] = useState({
    f1: [
      { fromMe: false, text: "Want to play some games? 🎮", time: timeNow() },
      { fromMe: true, text: "Sure! What game are you thinking?", time: timeNow() },
    ],
  });

  function addPartyMember(friendId) {
    const f = friends.find((x) => x.id === friendId);
    if (!f) return;
    if (party.some((p) => p.name === f.name)) return;
    setParty((p) => [...p, { id: f.id, name: f.name, role: "Member", avatar: f.avatar }]);
  }

  function sendMessage(id, text) {
    setChats((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), { fromMe: true, text, time: timeNow() }],
    }));
    setTimeout(() => {
      setChats((prev) => ({
        ...prev,
        [id]: [...(prev[id] ?? []), { fromMe: false, text: "Let's game together!", time: timeNow() }],
      }));
    }, 600);
  }

  function onInviteFriend(id) {
    setChats((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), { fromMe: true, text: "📨 Party invite sent.", time: timeNow() }],
    }));
  }

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,_#0b0b10_0%,_#0d0d12_100%)] text-zinc-100">
      <div className="mx-auto max-w-none p-6">
        <TopBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* Party Widget at top */}
        {tab === "play" && (
          <div className="mt-6">
            <PartyWidget 
              friends={friends}
              onInviteFriend={onInviteFriend}
              party={party}
              onAddMember={addPartyMember}
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-12 gap-6">
          {/* Left nav */}
          <Card className="col-span-12 h-full md:col-span-2">
            <LeftNav
              current={tab}
              setCurrent={(x) => {
                if (x === "settings") setSettingsOpen(true);
                else setTab(x);
              }}
            />
          </Card>

          {/* Main center column */}
          <div className="col-span-12 md:col-span-7">
            {tab === "home" && (
              <div className="space-y-3">
                <GameView selectedGame={selectedGame} games={GAMES} />
                <NewsPanel />
              </div>
            )}
            {tab === "play" && (
              <div className="space-y-3">
                <GameLobby 
                  selectedGame={selectedGame}
                  onGameChange={setSelectedGame}
                  games={GAMES}
                />
                <GameView selectedGame={selectedGame} games={GAMES} />
              </div>
            )}
            {tab === "profile" && <ProfileView />}
          </div>

          {/* Right friends/chat */}
          <Card className="col-span-12 md:col-span-3">
            <FriendsPanel
              friends={friends}
              activeFriendId={activeFriendId}
              onSelectFriend={setActiveFriendId}
              chats={chats}
              onSend={sendMessage}
              onInvite={onInviteFriend}
            />
          </Card>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
