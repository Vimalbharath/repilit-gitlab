import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardList,
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X,
  Lock,
  UserCheck,
  Settings,
} from 'lucide-react';
import {
  getGetDashboardSummaryQueryKey,
  getGetLeaderboardQueryKey,
  getGetPublicEventQueryKey,
  getHealthCheckQueryKey,
  getListGamesQueryKey,
  useCreateHouse,
  useCreateOrganizer,
  useCreateTournament,
  useGetDashboardSummary,
  useGetLeaderboard,
  useGetPublicEvent,
  useHealthCheck,
  useListGames,
  useRegisterPlayer,
} from '@workspace/api-client-react';
import type {
  DashboardSummary,
  Game,
  House as HouseType,
  LeaderboardEntry,
  Organizer,
  PublicEvent,
  Registration,
  Tournament,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();

type UserRole = 'public' | 'organizer' | 'root';

const sampleGames: Game[] = [
  { id: 1, name: 'Rocket League', description: 'Boost, rotate, and read the field.', rules: '3v3 • Best of 3', minPlayers: 6, maxPlayers: 24, accent: '#eb6944' },
  { id: 2, name: 'Chess', description: 'Quiet openings. Decisive finishes.', rules: 'Swiss • 5 rounds', minPlayers: 4, maxPlayers: 64, accent: '#16858d' },
  { id: 3, name: 'Volleyball', description: 'One court. Every point matters.', rules: '6v6 • First to 21', minPlayers: 12, maxPlayers: 48, accent: '#d5a52e' },
  { id: 4, name: 'Mario Kart', description: 'The shortcut is part of the strategy.', rules: 'Grand Prix • 4 races', minPlayers: 4, maxPlayers: 32, accent: '#6e73aa' },
];

const sampleOrganizer: Organizer = {
  id: 1, name: 'Northbridge Academy', slug: 'northbridge-academy',
  tagline: 'One school. Four houses. One unforgettable day.',
  logoInitials: 'NA', eventDate: '2025-06-21', status: 'active',
};
const sampleHouses: HouseType[] = [
  { id: 1, name: 'Alder', color: '#e76f51', points: 486, playerCount: 28 },
  { id: 2, name: 'Beacon', color: '#198f91', points: 441, playerCount: 26 },
  { id: 3, name: 'Cedar', color: '#d5a52e', points: 398, playerCount: 24 },
  { id: 4, name: 'Dunlin', color: '#6e73aa', points: 352, playerCount: 22 },
];
const sampleTournaments: Tournament[] = [
  { id: 1, name: 'Rocket League · Finals', gameId: 1, gameName: 'Rocket League', startDate: '2025-06-21T09:00:00Z', status: 'open', registeredPlayers: 42 },
  { id: 2, name: 'Chess · Open', gameId: 2, gameName: 'Chess', startDate: '2025-06-21T10:30:00Z', status: 'open', registeredPlayers: 31 },
  { id: 3, name: 'Volleyball · Pool A', gameId: 3, gameName: 'Volleyball', startDate: '2025-06-21T13:00:00Z', status: 'draft', registeredPlayers: 18 },
];
const sampleRegistrations: Registration[] = [
  { id: 1, playerName: 'Maya Chen', email: 'maya@example.com', houseId: 1, houseName: 'Alder', tournamentId: 1, tournamentName: 'Rocket League · Finals', registeredAt: '2025-06-03T14:23:00Z' },
  { id: 2, playerName: 'Theo Martins', email: 'theo@example.com', houseId: 2, houseName: 'Beacon', tournamentId: 2, tournamentName: 'Chess · Open', registeredAt: '2025-06-03T13:42:00Z' },
  { id: 3, playerName: 'Sofia Patel', email: 'sofia@example.com', houseId: 3, houseName: 'Cedar', tournamentId: 1, tournamentName: 'Rocket League · Finals', registeredAt: '2025-06-03T12:18:00Z' },
  { id: 4, playerName: 'Jon Bell', email: 'jon@example.com', houseId: 1, houseName: 'Alder', tournamentId: 3, tournamentName: 'Volleyball · Pool A', registeredAt: '2025-06-03T11:05:00Z' },
];

function fallbackDashboard(): DashboardSummary {
  return { organizer: sampleOrganizer, games: sampleGames, houses: sampleHouses, tournaments: sampleTournaments, recentRegistrations: sampleRegistrations };
}
function fallbackPublic(): PublicEvent {
  return { organizer: sampleOrganizer, games: sampleGames, houses: sampleHouses, tournaments: sampleTournaments, recentRegistrations: sampleRegistrations };
}
function arrayOr<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value as T[] : fallback;
}
function normalizeDashboard(value: unknown): DashboardSummary {
  if (!value || typeof value !== 'object') return fallbackDashboard();
  const candidate = value as Partial<DashboardSummary>;
  return {
    organizer: candidate.organizer ?? sampleOrganizer,
    games: arrayOr(candidate.games, sampleGames),
    houses: arrayOr(candidate.houses, sampleHouses),
    tournaments: arrayOr(candidate.tournaments, sampleTournaments),
    recentRegistrations: arrayOr(candidate.recentRegistrations, sampleRegistrations),
  };
}
function normalizePublicEvent(value: unknown): PublicEvent {
  if (!value || typeof value !== 'object') return fallbackPublic();
  const candidate = value as Partial<PublicEvent>;
  return {
    organizer: candidate.organizer ?? sampleOrganizer,
    games: arrayOr(candidate.games, sampleGames),
    houses: arrayOr(candidate.houses, sampleHouses),
    tournaments: arrayOr(candidate.tournaments, sampleTournaments),
    recentRegistrations: arrayOr(candidate.recentRegistrations, sampleRegistrations),
  };
}
function fmtDate(date?: string, compact = false) {
  if (!date) return 'TBC';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', compact ? { day: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'long' });
}
function fmtTime(date?: string) {
  if (!date) return 'TBC';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function initials(name: string) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? 'bg-[#ef7047] text-[#fff8eb]' : 'bg-[#182c49] text-[#fff8eb]'} shadow-sm`}>
        <Trophy size={20} strokeWidth={2.4} />
      </span>
      <span className={`font-display text-[21px] font-extrabold tracking-[-0.04em] ${dark ? 'text-[#fff8eb]' : 'text-[#182c49]'}`}>house<span className={dark ? 'text-[#ef7047]' : 'text-[#ef7047]'}>cup</span></span>
    </Link>
  );
}

function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false, testId }: {
  children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'dark'; className?: string; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; testId?: string;
}) {
  const styles = {
    primary: 'bg-[#ef7047] text-[#fff8eb] shadow-[0_5px_0_#c65031] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#c65031] active:translate-y-0.5 active:shadow-[0_3px_0_#c65031]',
    secondary: 'bg-[#d9eeee] text-[#163e50] border border-[#b6d8d8] hover:bg-[#c8e4e4]',
    ghost: 'text-[#526273] hover:bg-[#eee8da] hover:text-[#182c49]',
    dark: 'bg-[#182c49] text-[#fff8eb] shadow-[0_5px_0_#0d1b30] hover:-translate-y-0.5',
  };
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`}>{children}</button>;
}

function TopNav({ cta = true }: { cta?: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 md:px-8">
      <Brand />
      <nav className="hidden items-center gap-7 text-sm font-semibold text-[#526273] md:flex">
        <Link href="/" className="transition-colors hover:text-[#ef7047]" data-testid="link-home-nav">Why House Cup</Link>
        <Link href="/dashboard" className="transition-colors hover:text-[#ef7047]" data-testid="link-dashboard-nav">Organizer workspace</Link>
        <Link href="/events/northbridge-academy" className="transition-colors hover:text-[#ef7047]" data-testid="link-event-nav">Preview an event</Link>
      </nav>
      {cta && <Link href="/dashboard" className="hidden md:block" data-testid="link-start-nav"><Button>Start a committee <ArrowRight size={16} /></Button></Link>}
    </header>
  );
}

function Home() {
  const gamesQuery = useListGames({ query: { queryKey: getListGamesQueryKey() } });
  const games = Array.isArray(gamesQuery.data) && gamesQuery.data.length ? gamesQuery.data : sampleGames;
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  return (
    <div className="noise min-h-[100dvh] overflow-hidden bg-[#f7f2e7]">
      <TopNav />
      <main>
        <section className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16">
          <div className="pointer-events-none absolute -right-28 top-2 hidden h-[520px] w-[520px] rounded-full border-[70px] border-[#dceced] opacity-80 md:block" />
          <div className="pointer-events-none absolute right-4 top-24 hidden h-4 w-4 rounded-full bg-[#d5a52e] md:block" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative z-10 page-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e0d5c2] bg-[#fff9ef] px-3 py-2 text-[11px] font-bold uppercase tracking-[.15em] text-[#ef7047]" data-testid="status-home">
                <CircleDot size={13} className="animate-pulse" /> The tournament command center
              </div>
              <h1 className="font-display max-w-[660px] text-[clamp(3.7rem,8vw,7.6rem)] font-extrabold leading-[.88] tracking-[-.075em] text-[#182c49]">
                Make the big day <span className="text-[#ef7047]">count.</span>
              </h1>
              <p className="mt-8 max-w-[530px] text-lg leading-8 text-[#526273] md:text-xl">
                House Cup brings the whole school into the same story — from the first sign-up to the final point on the board.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/dashboard" data-testid="link-home-start"><Button className="px-5 py-3.5">Build your committee <ArrowRight size={17} /></Button></Link>
                <Link href="/events/northbridge-academy" className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-[#182c49]" data-testid="link-home-preview">See a live event <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
              </div>
              <div className="mt-12 flex items-center gap-3 text-xs text-[#7d8892]">
                <span className={`h-2 w-2 rounded-full ${health.data ? 'bg-[#16858d]' : 'bg-[#d5a52e]'}`} />
                {health.data ? 'Systems ready for your next event' : 'Demo workspace ready to explore'}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[510px] rise-in delay-2">
              <div className="absolute -left-3 top-14 z-20 rounded-2xl border border-[#e0d5c2] bg-[#fffaf0] p-3 shadow-[0_18px_35px_rgba(24,44,73,.12)] md:-left-10" data-testid="card-hero-registration">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#7d8892]">just joined</p>
                <div className="mt-2 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#d9eeee] text-[10px] font-bold text-[#163e50]">MC</span><span className="text-xs font-bold text-[#182c49]">Maya → Alder</span><Check size={14} className="text-[#16858d]" /></div>
              </div>
              <div className="relative overflow-hidden rounded-[2rem] bg-[#182c49] p-5 shadow-[0_28px_60px_rgba(24,44,73,.2)] md:p-7">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[22px] border-[#ef7047]/70" />
                <div className="relative flex items-start justify-between border-b border-white/15 pb-7">
                  <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#91c9c9]">northbridge academy</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.06em] text-[#fff8eb]">House Cup 2025</h2></div>
                  <span className="rounded-lg bg-[#ef7047] px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase text-[#fff8eb]">live</span>
                </div>
                <div className="relative py-7">
                  <div className="flex items-end justify-between"><div><p className="text-xs text-[#aec0c8]">current leader</p><p className="mt-1 font-display text-4xl font-extrabold text-[#fff8eb]">Alder</p></div><p className="font-mono text-3xl text-[#ef7047]">486 <span className="text-xs text-[#aec0c8]">pts</span></p></div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-[#ef7047]" /></div>
                  <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-wider text-[#aec0c8]"><span>4 houses</span><span>1,677 points on board</span></div>
                </div>
                <div className="relative grid grid-cols-2 gap-2">
                  {sampleHouses.slice(0, 4).map((house) => <div key={house.id} className="rounded-xl bg-white/7 p-3"><div className="mb-3 h-1.5 w-7 rounded-full" style={{ backgroundColor: house.color }} /><p className="text-xs font-bold text-[#fff8eb]">{house.name}</p><p className="mt-1 font-mono text-[10px] text-[#aec0c8]">{house.points} pts</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#e5dccd] bg-[#fffaf0]">
          <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-24">
            <div className="grid gap-10 md:grid-cols-[.72fr_1.28fr] md:items-end">
              <div><p className="font-mono text-xs uppercase tracking-[.2em] text-[#ef7047]">01 / the toolkit</p><h2 className="mt-4 font-display text-4xl font-extrabold leading-[.95] tracking-[-.06em] text-[#182c49] md:text-6xl">Every kind of<br />school energy.</h2></div>
              <p className="max-w-[480px] text-base leading-7 text-[#526273]">Pick the games your community already loves. House Cup keeps the rules visible, the brackets moving, and the whole school in the loop.</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {games.map((game, index) => <GameCard key={game.id} game={game} index={index} />)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-[#d9eeee] p-7 md:min-h-[410px] md:p-10">
              <div className="absolute right-[-60px] top-[-70px] h-64 w-64 rounded-full border-[34px] border-[#ef7047]/80" />
              <div className="absolute bottom-[-40px] left-[-30px] h-40 w-40 rounded-full bg-[#d5a52e]" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-[.18em] text-[#24666d]">the organizer view</span><LayoutDashboard size={22} className="text-[#24666d]" /></div>
                <div className="mt-16 rounded-2xl border border-[#b6d8d8] bg-[#fffaf0]/85 p-5 shadow-[0_15px_30px_rgba(22,62,80,.08)] backdrop-blur-sm">
                  <div className="flex items-center justify-between"><span className="font-display text-lg font-bold text-[#182c49]">Saturday run sheet</span><span className="font-mono text-[10px] text-[#ef7047]">09:00—16:30</span></div>
                  <div className="mt-5 space-y-3">{['Check-in opens', 'Rocket League finals', 'House Cup ceremony'].map((item, index) => <div key={item} className="flex items-center gap-3 text-sm"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#182c49] font-mono text-[10px] text-[#fff8eb]">0{index + 1}</span><span className={index === 1 ? 'font-bold text-[#ef7047]' : 'text-[#526273]'}>{item}</span><span className="ml-auto font-mono text-[10px] text-[#7d8892]">{['08:30', '10:00', '15:45'][index]}</span></div>)}</div>
                </div>
              </div>
            </div>
            <div><p className="font-mono text-xs uppercase tracking-[.2em] text-[#ef7047]">02 / one calm place</p><h2 className="mt-4 font-display text-4xl font-extrabold leading-[.95] tracking-[-.06em] text-[#182c49] md:text-6xl">Less chasing.<br /><span className="text-[#16858d]">More cheering.</span></h2><p className="mt-7 max-w-[500px] text-base leading-7 text-[#526273]">Registration, houses, games, schedules, and the leaderboard all live together. Organizers stay ahead without making players learn a system.</p><div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-[#182c49]"><span className="flex items-center gap-2"><Check size={16} className="text-[#ef7047]" /> Fast player sign-up</span><span className="flex items-center gap-2"><Check size={16} className="text-[#ef7047]" /> Live standings</span><span className="flex items-center gap-2"><Check size={16} className="text-[#ef7047]" /> Built for committees</span></div></div>
          </div>
        </section>

        <section className="bg-[#ef7047] text-[#fff8eb]"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 px-5 py-14 md:flex-row md:items-center md:px-8 md:py-20"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-[#ffd5c6]">03 / your turn</p><h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-[-.06em] md:text-6xl">Give the day<br />a scoreboard.</h2></div><Link href="/dashboard" data-testid="link-home-final"><Button variant="dark" className="px-6 py-4">Start your committee <ArrowRight size={17} /></Button></Link></div></section>
      </main>
      <footer className="bg-[#182c49] text-[#aec0c8]"><div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-8 text-xs md:flex-row md:items-center md:justify-between md:px-8"><Brand dark /><span>Made for the days your school talks about all year.</span><span className="font-mono text-[#708999]">HOUSE CUP / 2025</span></div></footer>
    </div>
  );
}

function GameCard({ game, index }: { game: Game; index: number }) {
  return <div className="card-lift group rounded-2xl border border-[#e4d9c9] bg-[#f7f2e7] p-5" data-testid={`card-game-${game.id}`}><div className="flex items-start justify-between"><span className="font-mono text-[10px] text-[#7d8892]">0{index + 1}</span><span className="h-3 w-3 rounded-full" style={{ backgroundColor: game.accent }} /></div><Gamepad2 size={25} className="mt-9 text-[#182c49] transition-transform group-hover:rotate-6" /><h3 className="mt-5 font-display text-xl font-bold tracking-[-.04em] text-[#182c49]">{game.name}</h3><p className="mt-2 min-h-12 text-sm leading-5 text-[#687583]">{game.description}</p><p className="mt-5 border-t border-[#e4d9c9] pt-4 font-mono text-[10px] uppercase tracking-wide text-[#7d8892]">{game.rules}</p></div>;
}

function Dashboard({ role }: { role: UserRole }) {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const gamesQuery = useListGames({ query: { queryKey: getListGamesQueryKey() } });
  const summary = normalizeDashboard(summaryQuery.data);
  const games = Array.isArray(gamesQuery.data) && gamesQuery.data.length ? gamesQuery.data : summary.games.length ? summary.games : sampleGames;
  const [modal, setModal] = useState<'organizer' | 'house' | 'tournament' | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');
  const organizer = summary.organizer;
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); };
  return <div className="noise dash-shell bg-[#f7f2e7]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col bg-[#182c49] px-5 py-6 text-[#fff8eb] transition-transform duration-300 md:relative md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Brand dark /><button className="text-[#aec0c8] md:hidden" onClick={() => setMobileNav(false)} data-testid="button-close-nav"><X size={20} /></button></div>
      <div className="mt-12"><p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-[#708999]">workspace</p><div className="space-y-1"><SidebarLink href="/dashboard" icon={<LayoutDashboard size={17} />} label="Overview" active /><SidebarLink href={`/events/${organizer.slug}`} icon={<ExternalLink size={17} />} label="Public event" /></div></div>
      <div className="mt-9"><p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-[#708999]">manage</p><div className="space-y-1"><SidebarLink href="/dashboard#tournaments" icon={<ClipboardList size={17} />} label="Tournaments" /><SidebarLink href="/dashboard#houses" icon={<Shield size={17} />} label="Houses" /><SidebarLink href="/dashboard#registrations" icon={<Users size={17} />} label="Registrations" /></div></div>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-[#91c9c9]"><CircleDot size={13} /><span className="font-mono text-[10px] uppercase tracking-wider">workspace status</span></div><p className="mt-3 text-xs leading-5 text-[#aec0c8]">Your event is ready for its next player.</p><Link href={`/events/${organizer.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#fff8eb]" data-testid="link-sidebar-public">Open public page <ArrowUpRight size={13} /></Link></div>
    </aside>
    {mobileNav && <button className="fixed inset-0 z-30 bg-[#182c49]/35 md:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation" data-testid="button-overlay-nav" />}
    <main className="dash-main">
      <div className="border-b border-[#e4d9c9] bg-[#fffaf0]/70"><div className="flex items-center justify-between px-5 py-4 md:px-10"><button className="rounded-lg p-2 text-[#182c49] md:hidden" onClick={() => setMobileNav(true)} data-testid="button-open-nav"><Menu size={22} /></button><div className="hidden items-center gap-2 text-xs text-[#7d8892] md:flex"><span className="h-2 w-2 rounded-full bg-[#16858d]" /> Organizer workspace <ChevronRight size={13} /> Overview</div><div className="ml-auto flex items-center gap-3"><span className="hidden font-mono text-[10px] uppercase tracking-wider text-[#7d8892] sm:inline">event day / {fmtDate(organizer.eventDate, true)}</span><button className="grid h-9 w-9 place-items-center rounded-full bg-[#d9eeee] text-xs font-extrabold text-[#163e50]" data-testid="button-account">{organizer.logoInitials || initials(organizer.name)}</button></div></div></div>
      <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10 md:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-[#ef7047]">good morning, committee</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-.06em] text-[#182c49] md:text-5xl">{organizer.name}</h1><p className="mt-2 text-sm text-[#687583]">{organizer.tagline}</p></div><div className="flex gap-2"><Button variant="secondary" onClick={() => setModal('organizer')} testId="button-edit-organizer"><Plus size={16} /> New organizer</Button><Button onClick={() => setModal('tournament')} testId="button-create-tournament"><Plus size={16} /> Schedule tournament</Button></div></div>
        {(summaryQuery.isError || gamesQuery.isError) && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e7b6a7] bg-[#fbe3dd] px-4 py-3 text-sm text-[#8e3c2a]" data-testid="status-dashboard-error"><span className="flex items-center gap-2"><CircleDot size={14} /> Live data is taking a breather. Showing the last-ready workspace.</span><button className="inline-flex items-center gap-1 font-bold" onClick={() => { void summaryQuery.refetch(); void gamesQuery.refetch(); }} data-testid="button-retry-dashboard"><RefreshCw size={14} /> Retry</button></div>}
        {notice && <div className="mt-5 flex items-center justify-between rounded-xl border border-[#b6d8d8] bg-[#d9eeee] px-4 py-3 text-sm font-semibold text-[#163e50] page-in" data-testid="status-dashboard-success"><span className="flex items-center gap-2"><Check size={16} /> {notice}</span><button onClick={() => setNotice('')} data-testid="button-dismiss-notice"><X size={15} /></button></div>}
        
        {role === 'root' && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-[#ef7047] bg-[#fffaf0] p-5 page-in">
            <div className="flex items-center gap-2 text-[#ef7047] font-bold text-sm">
              <Settings size={18} />
              <span>AWS Root User Console (Super Admin Mode)</span>
            </div>
            <p className="mt-2 text-xs text-[#526273]">
              You are logged in with root privileges. You can manage system-wide configurations, view raw telemetry, and override any organizer settings.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => alert('System state reset successfully!')} className="rounded-lg bg-[#182c49] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ef7047] transition-colors">
                Reset Global Database
              </button>
              <button onClick={() => alert('Telemetry logs downloaded.')} className="rounded-lg border border-[#e4d9c9] px-3 py-1.5 text-xs font-bold text-[#182c49] hover:bg-[#eee8da] transition-colors">
                Download Telemetry Logs
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Players registered" value={summary.tournaments.reduce((sum, t) => sum + t.registeredPlayers, 0)} note="+12 this week" icon={<Users size={19} />} accent="orange" />
          <StatCard label="Tournaments" value={summary.tournaments.length} note={`${summary.tournaments.filter((t) => t.status === 'open').length} open for sign-up`} icon={<ClipboardList size={19} />} accent="teal" />
          <StatCard label="Houses" value={summary.houses.length} note="all competing" icon={<Shield size={19} />} accent="gold" />
          <StatCard label="Games on the day" value={summary.games.length} note={`${summary.games.reduce((sum, g) => sum + g.maxPlayers, 0)} player capacity`} icon={<Gamepad2 size={19} />} accent="lilac" />
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
          <section id="tournaments" className="rounded-2xl border border-[#e4d9c9] bg-[#fffaf0] p-5 md:p-6"><SectionHeading eyebrow="the run sheet" title="Upcoming tournaments" action={<button className="text-xs font-bold text-[#ef7047]" onClick={() => setModal('tournament')} data-testid="button-add-tournament-inline">Add tournament <Plus size={14} className="inline" /></button>} /><div className="mt-6 space-y-2">{summary.tournaments.length ? summary.tournaments.map((tournament, index) => <TournamentRow tournament={tournament} key={tournament.id} index={index} />) : <EmptyState title="No tournaments yet" copy="Schedule the first game on your big day." action="Schedule a tournament" onClick={() => setModal('tournament')} />}</div></section>
          <section id="houses" className="rounded-2xl border border-[#e4d9c9] bg-[#fffaf0] p-5 md:p-6"><SectionHeading eyebrow="the houses" title="Points table" action={<button className="text-xs font-bold text-[#ef7047]" onClick={() => setModal('house')} data-testid="button-add-house-inline">Add house <Plus size={14} className="inline" /></button>} /><div className="mt-5 space-y-4">{summary.houses.length ? [...summary.houses].sort((a, b) => b.points - a.points).map((house, index) => <HouseRow house={house} key={house.id} rank={index + 1} />) : <EmptyState title="No houses yet" copy="Give your players a side to cheer for." action="Create a house" onClick={() => setModal('house')} />}</div></section>
        </div>
        <section id="registrations" className="mt-6 rounded-2xl border border-[#e4d9c9] bg-[#fffaf0] p-5 md:p-6"><SectionHeading eyebrow="the latest" title="Recent registrations" action={<Link href={`/events/${organizer.slug}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#ef7047]" data-testid="link-see-public">View public page <ArrowUpRight size={14} /></Link>} /><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[#e4d9c9] font-mono text-[10px] uppercase tracking-wider text-[#7d8892]"><th className="pb-3 font-normal">Player</th><th className="pb-3 font-normal">House</th><th className="pb-3 font-normal">Tournament</th><th className="pb-3 text-right font-normal">Registered</th></tr></thead><tbody>{summary.recentRegistrations.length ? summary.recentRegistrations.map((registration) => <RegistrationRow key={registration.id} registration={registration} />) : <tr><td colSpan={4}><EmptyState title="The list is clear" copy="New player registrations will appear here." /></td></tr>}</tbody></table></div></section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><section className="grid-paper rounded-2xl border border-[#e4d9c9] p-6"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ef7047]">quick action</p><h3 className="mt-3 font-display text-2xl font-bold tracking-[-.05em] text-[#182c49]">Make room for another house.</h3><p className="mt-2 text-sm leading-6 text-[#687583]">A house is more than a color. It is the thread that ties every game together.</p><Button variant="dark" className="mt-6 w-fit" onClick={() => setModal('house')} testId="button-create-house-card">Create a house <ArrowRight size={15} /></Button></section><section className="rounded-2xl bg-[#182c49] p-6 text-[#fff8eb]"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#91c9c9]">public event</p><h3 className="mt-3 font-display text-2xl font-bold tracking-[-.05em]">Ready to share.</h3></div><Sparkles className="text-[#ef7047]" size={21} /></div><p className="mt-2 max-w-md text-sm leading-6 text-[#aec0c8]">Send players straight to their registration page. No account, no friction, just their name on the board.</p><Link href={`/events/${organizer.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ef7047] px-4 py-3 text-sm font-bold text-[#fff8eb]" data-testid="link-open-public-card">Open event page <ExternalLink size={15} /></Link></section></div>
      </div>
    </main>
    {modal && <CreateModal kind={modal} games={games} organizerId={organizer.id} onClose={() => setModal(null)} onSuccess={(message) => { setModal(null); setNotice(message); refresh(); }} />}
  </div>;
}

function SidebarLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return <Link href={href} className={`sidebar-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? 'bg-[#ef7047] text-[#fff8eb]' : 'text-[#aec0c8] hover:bg-white/8 hover:text-[#fff8eb]'}`} data-testid={`link-sidebar-${label.toLowerCase().replace(' ', '-')}`}>{icon}<span>{label}</span>{active && <ChevronRight size={14} className="ml-auto" />}</Link>;
}
function StatCard({ label, value, note, icon, accent }: { label: string; value: number; note: string; icon: React.ReactNode; accent: string }) {
  const color = { orange: '#ef7047', teal: '#16858d', gold: '#d5a52e', lilac: '#6e73aa' }[accent];
  return <div className="card-lift rounded-2xl border border-[#e4d9c9] bg-[#fffaf0] p-5" data-testid={`card-stat-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}>{icon}</span><ArrowUpRight size={15} className="text-[#b9b1a3]" /></div><p className="mt-6 stat-number text-4xl font-extrabold text-[#182c49]">{value}</p><p className="mt-1 text-xs font-bold text-[#526273]">{label}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#7d8892]">{note}</p></div>;
}
function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ef7047]">{eyebrow}</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.05em] text-[#182c49]">{title}</h2></div>{action}</div>;
}
function TournamentRow({ tournament, index }: { tournament: Tournament; index: number }) {
  return <div className="group flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-[#e4d9c9] hover:bg-[#f7f2e7]" data-testid={`row-tournament-${tournament.id}`}><span className="hidden font-mono text-xs text-[#b9b1a3] sm:block">0{index + 1}</span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d9eeee] text-[#16858d]"><Gamepad2 size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#182c49]">{tournament.name}</p><p className="mt-1 text-xs text-[#7d8892]">{tournament.gameName} <span className="mx-1">·</span> {fmtDate(tournament.startDate, true)} at {fmtTime(tournament.startDate)}</p></div><div className="hidden text-right sm:block"><p className="font-mono text-sm font-medium text-[#182c49]">{tournament.registeredPlayers}</p><p className="text-[10px] uppercase tracking-wider text-[#7d8892]">players</p></div><span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${tournament.status === 'open' ? 'bg-[#d9eeee] text-[#16858d]' : 'bg-[#eee8da] text-[#7d8892]'}`}>{tournament.status}</span></div>;
}
function HouseRow({ house, rank }: { house: HouseType; rank: number }) {
  return <div className="flex items-center gap-3" data-testid={`row-house-${house.id}`}><span className="w-4 font-mono text-[10px] text-[#b9b1a3]">0{rank}</span><span className="h-3 w-3 rounded-full" style={{ backgroundColor: house.color }} /><span className="flex-1 text-sm font-bold text-[#182c49]">{house.name}</span><span className="font-mono text-sm text-[#182c49]">{house.points}</span><span className="w-14 text-right text-[10px] text-[#7d8892]">{house.playerCount} players</span></div>;
}
function RegistrationRow({ registration }: { registration: Registration }) {
  return <tr className="border-b border-[#eee8da] last:border-0" data-testid={`row-registration-${registration.id}`}><td className="py-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9eeee] text-[10px] font-bold text-[#163e50]">{initials(registration.playerName)}</span><div><p className="font-bold text-[#182c49]">{registration.playerName}</p><p className="text-xs text-[#7d8892]">{registration.email}</p></div></div></td><td className="py-4 text-[#526273]">{registration.houseName}</td><td className="py-4 text-[#526273]">{registration.tournamentName}</td><td className="py-4 text-right font-mono text-[10px] text-[#7d8892]">{fmtDate(registration.registeredAt, true)}</td></tr>;
}
function EmptyState({ title, copy, action, onClick }: { title: string; copy: string; action?: string; onClick?: () => void }) {
  return <div className="flex flex-col items-center justify-center py-10 text-center"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eee8da] text-[#7d8892]"><ClipboardList size={19} /></span><p className="mt-3 text-sm font-bold text-[#182c49]">{title}</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-[#7d8892]">{copy}</p>{action && <button onClick={onClick} className="mt-4 text-xs font-bold text-[#ef7047]" data-testid="button-empty-action">{action} <ArrowRight size={13} className="inline" /></button>}</div>;
}

function CreateModal({ kind, games, organizerId, onClose, onSuccess }: { kind: 'organizer' | 'house' | 'tournament'; games: Game[]; organizerId: number; onClose: () => void; onSuccess: (message: string) => void }) {
  const createOrganizer = useCreateOrganizer();
  const createHouse = useCreateHouse();
  const createTournament = useCreateTournament();
  const [name, setName] = useState(kind === 'organizer' ? '' : kind === 'house' ? '' : '');
  const [tagline, setTagline] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [color, setColor] = useState('#ef7047');
  const [gameId, setGameId] = useState(String(games[0]?.id ?? 1));
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const pending = createOrganizer.isPending || createHouse.isPending || createTournament.isPending;
  const title = kind === 'organizer' ? 'Start a new committee' : kind === 'house' ? 'Add a house' : 'Schedule a tournament';
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (kind === 'organizer') {
      if (name.trim().length < 2 || tagline.trim().length < 2 || eventDate.length < 8) { setError('Add a name, a short tagline, and an event date.'); return; }
      createOrganizer.mutate({ data: { name, tagline, eventDate } }, { onSuccess: () => onSuccess('Your new committee is ready.'), onError: () => setError('Could not create the committee. Please try again.') });
    } else if (kind === 'house') {
      if (name.trim().length < 2) { setError('House names need at least two characters.'); return; }
      createHouse.mutate({ organizerId, data: { name, color } }, { onSuccess: () => onSuccess(`${name} is now in the cup.`), onError: () => setError('Could not add the house. Please try again.') });
    } else {
      if (name.trim().length < 2 || startDate.length < 8) { setError('Add a tournament name and start time.'); return; }
      createTournament.mutate({ organizerId, data: { name, gameId: Number(gameId), startDate } }, { onSuccess: () => onSuccess(`${name} has been added to the run sheet.`), onError: () => setError('Could not schedule the tournament. Please try again.') });
    }
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#182c49]/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" data-testid={`modal-${kind}`}><div className="w-full max-w-[480px] rounded-2xl border border-[#e4d9c9] bg-[#fffaf0] p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ef7047]">quick setup</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.06em] text-[#182c49]">{title}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-[#7d8892] hover:bg-[#eee8da]" data-testid="button-close-modal"><X size={18} /></button></div><form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-[#526273]">{kind === 'organizer' ? 'School or committee name' : kind === 'house' ? 'House name' : 'Tournament name'}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === 'house' ? 'e.g. Hawthorn' : kind === 'tournament' ? 'e.g. Chess · Open' : 'e.g. Northbridge Academy'} className="w-full rounded-xl border border-[#d8cebe] bg-[#f7f2e7] px-4 py-3 text-sm text-[#182c49] outline-none transition focus:border-[#ef7047] focus:ring-2 focus:ring-[#ef7047]/15" data-testid={`input-${kind}-name`} /></label>{kind === 'organizer' && <><label className="block"><span className="mb-2 block text-xs font-bold text-[#526273]">Event tagline</span><input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One school. One unforgettable day." className="w-full rounded-xl border border-[#d8cebe] bg-[#f7f2e7] px-4 py-3 text-sm text-[#182c49] outline-none focus:border-[#ef7047] focus:ring-2 focus:ring-[#ef7047]/15" data-testid="input-organizer-tagline" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-[#526273]">Event date</span><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-xl border border-[#d8cebe] bg-[#f7f2e7] px-4 py-3 text-sm text-[#182c49] outline-none focus:border-[#ef7047] focus:ring-2 focus:ring-[#ef7047]/15" data-testid="input-organizer-date" /></label></>}{kind === 'house' && <label className="block"><span className="mb-2 block text-xs font-bold text-[#526273]">House color</span><div className="flex gap-2">{['#ef7047', '#16858d', '#d5a52e', '#6e73aa', '#7d9a72'].map((swatch) => <button type="button" key={swatch} onClick={() => setColor(swatch)} className={`h-9 w-9 rounded-full border-4 ${color === swatch ? 'border-[#182c49]' : 'border-transparent'}`} style={{ backgroundColor: swatch }} aria-label={`Use ${swatch}`} data-testid={`button-color-${swatch.slice(1)}`} />)}</div></label>}{kind === 'tournament' && <><label className="block"><span className="mb-2 block text-xs font-bold text-[#526273]">Game</span><select value={gameId} onChange={(e) => setGameId(e.target.value)} className="select-reset w-full rounded-xl border border-[#d8cebe] bg-[#f7f2e7] px-4 py-3 text-sm text-[#182c49] outline-none focus:border-[#ef7047]" data-testid="select-tournament-game">{games.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-bold text-[#526273]">Start date and time</span><input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-[#d8cebe] bg-[#f7f2e7] px-4 py-3 text-sm text-[#182c49] outline-none focus:border-[#ef7047] focus:ring-2 focus:ring-[#ef7047]/15" data-testid="input-tournament-date" /></label></>}{error && <p className="rounded-lg bg-[#fbe3dd] px-3 py-2 text-xs font-semibold text-[#a33e29]" data-testid="status-modal-error">{error}</p>}<div className="flex justify-end gap-3 pt-3"><Button variant="ghost" onClick={onClose} testId="button-cancel-modal">Cancel</Button><Button type="submit" disabled={pending} testId="button-submit-modal">{pending ? 'Saving…' : 'Save to workspace'} <ArrowRight size={15} /></Button></div></form></div></div>;
}

function PublicEventPage() {
  const params = useParams<{ organizerSlug: string }>();
  const slug = params.organizerSlug ?? 'northbridge-academy';
  const eventQuery = useGetPublicEvent(slug, { query: { queryKey: getGetPublicEventQueryKey(slug) } });
  const event = normalizePublicEvent(eventQuery.data);
  const [showAllGames, setShowAllGames] = useState(false);
  const [registered, setRegistered] = useState<Registration | null>(null);
  const register = useRegisterPlayer();
  const games = showAllGames ? event.games : event.games.slice(0, 3);
  return <div className="noise min-h-[100dvh] bg-[#f7f2e7]">
    <div className="border-b border-[#e4d9c9] bg-[#fffaf0]"><div className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4 md:px-8"><Brand /><Link href={`/events/${slug}/leaderboard`} className="inline-flex items-center gap-2 text-sm font-bold text-[#182c49]" data-testid="link-public-leaderboard">View leaderboard <BarChart3 size={16} className="text-[#ef7047]" /></Link></div></div>
    <main className="mx-auto max-w-[1120px] px-5 pb-20 md:px-8">
      <section className="relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20"><div className="absolute -right-24 top-10 h-72 w-72 rounded-full border-[44px] border-[#d9eeee]" /><div className="relative z-10 max-w-[760px] page-in"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#182c49] font-display text-lg font-extrabold text-[#fff8eb]">{event.organizer.logoInitials || initials(event.organizer.name)}</span><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#16858d]">you are invited to</p><p className="text-sm font-bold text-[#182c49]">{event.organizer.name}</p></div></div><h1 className="mt-8 font-display text-[clamp(3.2rem,7vw,6.8rem)] font-extrabold leading-[.86] tracking-[-.075em] text-[#182c49]">The day<br /><span className="text-[#ef7047]">starts here.</span></h1><p className="mt-7 max-w-[560px] text-lg leading-8 text-[#526273]">{event.organizer.tagline}</p><div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-bold text-[#182c49]"><span className="flex items-center gap-2"><CalendarDays size={17} className="text-[#ef7047]" /> {fmtDate(event.organizer.eventDate)}</span><span className="h-1 w-1 rounded-full bg-[#d5a52e]" /><span className="flex items-center gap-2"><Users size={17} className="text-[#16858d]" /> {event.houses.length} houses competing</span></div></div></section>
      {eventQuery.isError && <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e7b6a7] bg-[#fbe3dd] px-4 py-3 text-sm text-[#8e3c2a]" data-testid="status-public-error"><span className="flex items-center gap-2"><CircleDot size={14} /> Preview data is showing while this event reconnects.</span><button className="inline-flex items-center gap-1 font-bold" onClick={() => { void eventQuery.refetch(); }} data-testid="button-retry-public"><RefreshCw size={14} /> Retry</button></div>}
      {registered && <div className="mb-8 flex items-start gap-4 rounded-2xl border border-[#a9d1d0] bg-[#d9eeee] p-5 page-in" data-testid="status-registration-success"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#16858d] text-[#fff8eb]"><Check size={21} /></span><div><p className="font-display text-xl font-bold tracking-[-.04em] text-[#163e50]">You’re on the board, {registered.playerName.split(' ')[0]}.</p><p className="mt-1 text-sm text-[#24666d]">Registered for {registered.tournamentName}. Find your house and get ready to play.</p></div><button className="ml-auto text-[#24666d]" onClick={() => setRegistered(null)} data-testid="button-dismiss-registration"><X size={17} /></button></div>}
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
        <section className="rounded-[1.75rem] bg-[#182c49] p-6 text-[#fff8eb] shadow-[0_20px_45px_rgba(24,44,73,.16)] md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#91c9c9]">join the cup</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.06em]">Put your name<br />on the board.</h2></div><Sparkles size={22} className="text-[#ef7047]" /></div><RegistrationForm event={event} isPending={register.isPending} onRegister={(payload) => register.mutate({ organizerSlug: slug, data: payload }, { onSuccess: (result) => { setRegistered(result); void queryClient.invalidateQueries({ queryKey: getGetPublicEventQueryKey(slug) }); void queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey(slug) }); }, onError: () => window.alert('We could not complete that registration. Please check your details and try again.') })} /></section>
        <section className="rounded-[1.75rem] border border-[#e4d9c9] bg-[#fffaf0] p-6 md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ef7047]">the programme</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.06em] text-[#182c49]">Choose your arena.</h2></div><Gamepad2 size={22} className="text-[#16858d]" /></div><div className="mt-6 space-y-2">{event.tournaments.filter((t) => t.status !== 'draft').map((tournament) => <div key={tournament.id} className="rounded-xl border border-[#e4d9c9] p-4" data-testid={`card-public-tournament-${tournament.id}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#182c49]">{tournament.name}</p><p className="mt-1 text-xs text-[#7d8892]">{tournament.gameName} <span className="mx-1">·</span> {fmtDate(tournament.startDate, true)} at {fmtTime(tournament.startDate)}</p></div><span className="rounded-full bg-[#d9eeee] px-2 py-1 font-mono text-[9px] uppercase text-[#16858d]">{tournament.registeredPlayers} in</span></div></div>)}{!event.tournaments.length && <EmptyState title="Programme coming soon" copy="The committee is still setting the schedule." />}</div></section>
      </div>
      <section className="mt-10"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ef7047]">the games</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.06em] text-[#182c49]">What are you playing?</h2></div>{event.games.length > 3 && <button onClick={() => setShowAllGames(!showAllGames)} className="text-xs font-bold text-[#ef7047]" data-testid="button-toggle-games">{showAllGames ? 'Show less' : `See all ${event.games.length} games`}</button>}</div><div className="mt-5 grid gap-3 md:grid-cols-3">{games.map((game) => <GameCard key={game.id} game={game} index={event.games.indexOf(game)} />)}</div></section>
      <section className="mt-10 rounded-[1.75rem] bg-[#d9eeee] p-6 md:p-8"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#16858d]">the house cup</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.06em] text-[#163e50]">Who’s leading?</h2></div><Link href={`/events/${slug}/leaderboard`} className="inline-flex items-center gap-2 text-sm font-bold text-[#163e50]" data-testid="link-view-standings">Full standings <ArrowRight size={16} /></Link></div><div className="mt-7 grid gap-3 md:grid-cols-4">{[...event.houses].sort((a, b) => b.points - a.points).map((house, index) => <div key={house.id} className={`rounded-2xl bg-[#fffaf0] p-4 ${index === 0 ? 'ring-2 ring-[#ef7047]' : ''}`} data-testid={`card-standing-${house.id}`}><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#7d8892]">0{index + 1}</span><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: house.color }} /></div><p className="mt-6 font-display text-xl font-bold text-[#182c49]">{house.name}</p><p className="mt-1 font-mono text-sm text-[#16858d]">{house.points} <span className="text-[10px] text-[#7d8892]">points</span></p></div>)}</div></section>
    </main>
    <footer className="border-t border-[#e4d9c9] bg-[#fffaf0]"><div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 py-8 text-xs text-[#7d8892] md:flex-row md:items-center md:justify-between md:px-8"><Brand /><span>Bring your house. Bring your noise.</span></div></footer>
  </div>;
}

function RegistrationForm({ event, isPending, onRegister }: { event: PublicEvent; isPending: boolean; onRegister: (payload: { playerName: string; email: string; houseId: number; tournamentId: number }) => void }) {
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [houseId, setHouseId] = useState(String(event.houses[0]?.id ?? ''));
  const openTournaments = event.tournaments.filter((t) => t.status !== 'closed');
  const [tournamentId, setTournamentId] = useState(String(openTournaments[0]?.id ?? ''));
  const [error, setError] = useState('');
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (playerName.trim().length < 2 || !email.includes('@') || !houseId || !tournamentId) { setError('Fill in your name, a valid email, house, and game.'); return; } setError(''); onRegister({ playerName, email, houseId: Number(houseId), tournamentId: Number(tournamentId) }); };
  return <form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-[#aec0c8]">Your name</span><input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="First and last name" className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-[#fff8eb] outline-none placeholder:text-[#708999] focus:border-[#ef7047] focus:ring-2 focus:ring-[#ef7047]/20" data-testid="input-player-name" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-[#aec0c8]">Email address</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Where should we send details?" className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-[#fff8eb] outline-none placeholder:text-[#708999] focus:border-[#ef7047] focus:ring-2 focus:ring-[#ef7047]/20" data-testid="input-player-email" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold text-[#aec0c8]">Your house</span><select value={houseId} onChange={(e) => setHouseId(e.target.value)} className="select-reset w-full rounded-xl border border-white/15 bg-[#223957] px-4 py-3 text-sm text-[#fff8eb] outline-none focus:border-[#ef7047]" data-testid="select-player-house">{event.houses.map((house) => <option value={house.id} key={house.id}>{house.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-bold text-[#aec0c8]">Your game</span><select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="select-reset w-full rounded-xl border border-white/15 bg-[#223957] px-4 py-3 text-sm text-[#fff8eb] outline-none focus:border-[#ef7047]" data-testid="select-player-tournament">{openTournaments.map((tournament) => <option value={tournament.id} key={tournament.id}>{tournament.gameName}</option>)}</select></label></div>{error && <p className="rounded-lg bg-[#ef7047]/15 px-3 py-2 text-xs font-semibold text-[#ffd5c6]" data-testid="status-registration-error">{error}</p><Button type="submit" disabled={isPending} className="mt-2 w-full py-3.5" testId="button-register-player">{isPending ? 'Adding you to the board…' : 'Register me to play'} <ArrowRight size={16} /></Button><p className="text-center text-[10px] text-[#708999]">No account needed. Your committee will only use this for event details.</p></form>;
}

function LeaderboardPage() {
  const params = useParams<{ organizerSlug: string }>();
  const slug = params.organizerSlug ?? 'northbridge-academy';
  const eventQuery = useGetPublicEvent(slug, { query: { queryKey: getGetPublicEventQueryKey(slug) } });
  const leaderboardQuery = useGetLeaderboard(slug, { query: { queryKey: getGetLeaderboardQueryKey(slug) } });
  const event = normalizePublicEvent(eventQuery.data);
  const entries: LeaderboardEntry[] = Array.isArray(leaderboardQuery.data) && leaderboardQuery.data.length ? leaderboardQuery.data : event.houses.map((house, index) => ({ rank: index + 1, houseId: house.id, houseName: house.name, color: house.color, points: house.points, playerCount: house.playerCount, trend: index === 0 ? 'up' : 'steady' }));
  return <div className="noise min-h-[100dvh] bg-[#182c49] text-[#fff8eb]"><header className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-5 md:px-8"><Brand dark /><Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#aec0c8] hover:text-[#fff8eb]" data-testid="link-back-event"><ArrowRight size={16} className="rotate-180" /> Back to event</Link></header><main className="mx-auto max-w-[1000px] px-5 pb-24 pt-10 md:px-8 md:pt-20"><div className="max-w-[680px] page-in"><p className="font-mono text-xs uppercase tracking-[.2em] text-[#91c9c9]">house cup / standings</p><h1 className="mt-5 font-display text-6xl font-extrabold leading-[.88] tracking-[-.075em] md:text-8xl">The board<br /><span className="text-[#ef7047]">doesn’t lie.</span></h1><p className="mt-7 text-lg leading-8 text-[#aec0c8]">{event.organizer.name} · {fmtDate(event.organizer.eventDate)} · live points across every game</p></div>{(eventQuery.isError || leaderboardQuery.isError) && <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ef7047]/35 bg-[#ef7047]/10 px-4 py-3 text-sm text-[#ffd5c6]" data-testid="status-leaderboard-error"><span className="flex items-center gap-2"><CircleDot size={14} /> Showing the last-ready standings while we reconnect.</span><button className="inline-flex items-center gap-1 font-bold" onClick={() => { void eventQuery.refetch(); void leaderboardQuery.refetch(); }} data-testid="button-retry-leaderboard"><RefreshCw size={14} /> Retry</button></div>}<div className="mt-14 overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/5"><div className="grid grid-cols-[46px_1fr_95px_95px] gap-3 border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#708999] md:grid-cols-[70px_1fr_130px_130px] md:px-8"><span>rank</span><span>house</span><span className="text-right">players</span><span className="text-right">points</span></div>{entries.map((entry, index) => <div key={entry.houseId} className={`grid grid-cols-[46px_1fr_95px_95px] items-center gap-3 px-5 py-5 transition-colors hover:bg-white/5 md:grid-cols-[70px_1fr_130px_130px] md:px-8 ${index === 0 ? 'bg-[#ef7047]/10' : ''}`} data-testid={`row-leaderboard-${entry.houseId}`}><span className={`font-display text-2xl font-bold ${index === 0 ? 'text-[#ef7047]' : 'text-[#aec0c8]'}`}>{String(entry.rank).padStart(2, '0')}</span><span className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} /><span><span className="block font-display text-xl font-bold tracking-[-.04em]">{entry.houseName}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-[#708999]">{entry.trend === 'up' ? 'rising this week' : 'holding steady'}</span></span></span><span className="text-right font-mono text-sm text-[#aec0c8]">{entry.playerCount}</span><span className={`text-right font-mono text-xl ${index === 0 ? 'text-[#ef7047]' : 'text-[#fff8eb]'}`}>{entry.points}</span></div>)}</div><div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#d9eeee] p-6 text-[#163e50] md:flex-row md:items-center"><div><p className="font-display text-xl font-bold tracking-[-.04em]">Not in the running yet?</p><p className="mt-1 text-sm text-[#24666d]">There is always another game to enter.</p></div><Link href={`/events/${slug}`} data-testid="link-leaderboard-register"><Button variant="dark">Join a tournament <ArrowRight size={16} /></Button></Link></div></main><footer className="border-t border-white/10"><div className="mx-auto flex max-w-[1000px] items-center justify-between px-5 py-7 text-xs text-[#708999] md:px-8"><span>housecup / {event.organizer.slug}</span><span className="font-mono">live standings</span></div></footer></div>;
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AccessDenied() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f7f2e7] p-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#fbe3dd] text-[#ef7047] mb-6">
        <Lock size={32} />
      </div>
      <h1 className="font-display text-3xl font-extrabold text-[#182c49] tracking-tight">Access Denied</h1>
      <p className="mt-3 max-w-md text-sm text-[#526273] leading-relaxed">
        You are currently logged in as a <strong>Normal Public User</strong>. Only registered Organisers or AWS Root Users can access the committee workspace.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
      </div>
    </div>
  );
}

function Router({ role }: { role: UserRole }) {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard">
          {role === 'public' ? <AccessDenied /> : <Dashboard role={role} />}
        </Route>
        <Route path="/events/:organizerSlug/leaderboard" component={LeaderboardPage} />
        <Route path="/events/:organizerSlug" component={PublicEventPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  const [role, setRole] = useState<UserRole>('organizer');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Simulated Authentication Control Bar */}
        <div className="bg-[#182c49] text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 relative z-50">
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-[#ef7047]" />
            <span className="font-semibold">Simulated Auth Role:</span>
            <span className="font-mono uppercase bg-white/10 px-1.5 py-0.5 rounded text-[#91c9c9]">
              {role === 'root' ? 'AWS Root User (Super Admin)' : role}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setRole('public')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${role === 'public' ? 'bg-[#ef7047] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              Public User
            </button>
            <button
              onClick={() => setRole('organizer')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${role === 'organizer' ? 'bg-[#ef7047] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              Organiser
            </button>
            <button
              onClick={() => setRole('root')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${role === 'root' ? 'bg-[#ef7047] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              AWS Root User
            </button>
          </div>
        </div>

        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router role={role} />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
