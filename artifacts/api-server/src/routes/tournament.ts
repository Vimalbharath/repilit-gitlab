import { Router, type IRouter } from "express";
import {
  CreateHouseBody,
  CreateHouseParams,
  CreateOrganizerBody,
  CreateTournamentBody,
  CreateTournamentParams,
  GetDashboardSummaryResponse,
  GetLeaderboardParams,
  GetLeaderboardResponse,
  GetPublicEventParams,
  GetPublicEventResponse,
  ListGamesResponse,
  RegisterPlayerBody,
  RegisterPlayerParams,
} from "@workspace/api-zod";

type Game = {
  id: number;
  name: string;
  description: string;
  rules: string;
  minPlayers: number;
  maxPlayers: number;
  accent: string;
};

type Organizer = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  logoInitials: string;
  eventDate: string;
  status: string;
};

type House = {
  id: number;
  name: string;
  color: string;
  points: number;
  playerCount: number;
};

type Tournament = {
  id: number;
  name: string;
  gameId: number;
  gameName: string;
  startDate: string;
  status: string;
  registeredPlayers: number;
};

type Registration = {
  id: number;
  playerName: string;
  email: string;
  houseId: number;
  houseName: string;
  tournamentId: number;
  tournamentName: string;
  registeredAt: string;
};

const games: Game[] = [
  {
    id: 1,
    name: "Kabaddi",
    description: "Fast, tactical team combat.",
    rules: "Two halves, raid and defend.",
    minPlayers: 7,
    maxPlayers: 12,
    accent: "saffron",
  },
  {
    id: 2,
    name: "Chess",
    description: "Quiet focus, decisive moves.",
    rules: "Swiss rounds with timed matches.",
    minPlayers: 1,
    maxPlayers: 2,
    accent: "indigo",
  },
  {
    id: 3,
    name: "Kho-Kho",
    description: "Speed, strategy, and sharp turns.",
    rules: "Chasers rotate after each touch.",
    minPlayers: 9,
    maxPlayers: 12,
    accent: "mint",
  },
  {
    id: 4,
    name: "Cricket",
    description: "The classic everyone gathers for.",
    rules: "Short-format matches to 6 overs.",
    minPlayers: 11,
    maxPlayers: 15,
    accent: "coral",
  },
];

let nextId = 5;
const organizer: Organizer = {
  id: 1,
  name: "St. Xavier's Annual Meet",
  slug: "st-xaviers-annual-meet",
  tagline: "Where every house brings its best.",
  logoInitials: "SX",
  eventDate: "2026-09-18",
  status: "Live",
};

const houses: House[] = [
  { id: 1, name: "House Orion", color: "#F1A33B", points: 1280, playerCount: 38 },
  { id: 2, name: "House Atlas", color: "#5878DB", points: 1140, playerCount: 34 },
  { id: 3, name: "House Verdant", color: "#4BAA88", points: 960, playerCount: 29 },
  { id: 4, name: "House Sol", color: "#E36D5E", points: 820, playerCount: 25 },
];

const tournaments: Tournament[] = [
  { id: 1, name: "Inter-house Kabaddi", gameId: 1, gameName: "Kabaddi", startDate: "2026-09-18", status: "Open", registeredPlayers: 32 },
  { id: 2, name: "Rapid Chess Cup", gameId: 2, gameName: "Chess", startDate: "2026-09-19", status: "Upcoming", registeredPlayers: 18 },
  { id: 3, name: "Kho-Kho Sprint", gameId: 3, gameName: "Kho-Kho", startDate: "2026-09-20", status: "Draft", registeredPlayers: 0 },
];

const registrations: Registration[] = [
  { id: 1, playerName: "Aarav Mehta", email: "aarav@example.com", houseId: 1, houseName: "House Orion", tournamentId: 1, tournamentName: "Inter-house Kabaddi", registeredAt: "2026-08-14T09:30:00Z" },
  { id: 2, playerName: "Mira Rao", email: "mira@example.com", houseId: 2, houseName: "House Atlas", tournamentId: 1, tournamentName: "Inter-house Kabaddi", registeredAt: "2026-08-13T16:12:00Z" },
  { id: 3, playerName: "Kabir Shah", email: "kabir@example.com", houseId: 3, houseName: "House Verdant", tournamentId: 2, tournamentName: "Rapid Chess Cup", registeredAt: "2026-08-13T14:02:00Z" },
];

const router: IRouter = Router();

const eventPayload = () => ({
  organizer,
  games,
  houses,
  tournaments,
  recentRegistrations: registrations.slice(-8).reverse(),
});

router.get("/games", (_req, res) => {
  res.json(ListGamesResponse.parse(games));
});

router.get("/dashboard/summary", (_req, res) => {
  res.json(GetDashboardSummaryResponse.parse(eventPayload()));
});

router.post("/organizers", (req, res) => {
  const input = CreateOrganizerBody.parse(req.body);
  const created = {
    id: nextId++,
    name: input.name,
    slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    tagline: input.tagline,
    logoInitials: input.name.slice(0, 2).toUpperCase(),
    eventDate: input.eventDate,
    status: "Live",
  };
  Object.assign(organizer, created);
  res.status(201).json(created);
});

router.post("/organizers/:organizerId/houses", (req, res) => {
  CreateHouseParams.parse({ organizerId: Number(req.params.organizerId) });
  const input = CreateHouseBody.parse(req.body);
  const created = { id: nextId++, name: input.name, color: input.color, points: 0, playerCount: 0 };
  houses.push(created);
  res.status(201).json(created);
});

router.post("/organizers/:organizerId/tournaments", (req, res) => {
  CreateTournamentParams.parse({ organizerId: Number(req.params.organizerId) });
  const input = CreateTournamentBody.parse(req.body);
  const game = games.find((item) => item.id === input.gameId) ?? games[0];
  const created = {
    id: nextId++,
    name: input.name,
    gameId: game.id,
    gameName: game.name,
    startDate: input.startDate,
    status: "Upcoming",
    registeredPlayers: 0,
  };
  tournaments.push(created);
  res.status(201).json(created);
});

router.get("/events/:organizerSlug", (req, res) => {
  GetPublicEventParams.parse({ organizerSlug: req.params.organizerSlug });
  if (req.params.organizerSlug !== organizer.slug) {
    res.status(404).json({ error: "Organizer not found" });
    return;
  }
  res.json(GetPublicEventResponse.parse(eventPayload()));
});

router.post("/events/:organizerSlug/registrations", (req, res) => {
  RegisterPlayerParams.parse({ organizerSlug: req.params.organizerSlug });
  const input = RegisterPlayerBody.parse(req.body);
  const house = houses.find((item) => item.id === input.houseId) ?? houses[0];
  const tournament = tournaments.find((item) => item.id === input.tournamentId) ?? tournaments[0];
  const created = {
    id: nextId++,
    playerName: input.playerName,
    email: input.email,
    houseId: house.id,
    houseName: house.name,
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    registeredAt: new Date().toISOString(),
  };
  registrations.push(created);
  house.playerCount += 1;
  tournament.registeredPlayers += 1;
  res.status(201).json(created);
});

router.get("/events/:organizerSlug/leaderboard", (req, res) => {
  GetLeaderboardParams.parse({ organizerSlug: req.params.organizerSlug });
  if (req.params.organizerSlug !== organizer.slug) {
    res.status(404).json({ error: "Organizer not found" });
    return;
  }
  const result = houses
    .slice()
    .sort((a, b) => b.points - a.points)
    .map((house, index) => ({ rank: index + 1, houseId: house.id, houseName: house.name, color: house.color, points: house.points, playerCount: house.playerCount, trend: index === 0 ? "up" : "steady" }));
  res.json(GetLeaderboardResponse.parse(result));
});

export default router;