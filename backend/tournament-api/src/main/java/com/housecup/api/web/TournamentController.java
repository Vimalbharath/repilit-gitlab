package com.housecup.api.web;

import com.housecup.api.domain.Game;
import com.housecup.api.domain.House;
import com.housecup.api.domain.Organizer;
import com.housecup.api.domain.Registration;
import com.housecup.api.domain.Tournament;
import com.housecup.api.repository.GameRepository;
import com.housecup.api.repository.HouseRepository;
import com.housecup.api.repository.OrganizerRepository;
import com.housecup.api.repository.RegistrationRepository;
import com.housecup.api.repository.TournamentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping
@CrossOrigin
public class TournamentController {
    private final GameRepository games;
    private final OrganizerRepository organizers;
    private final HouseRepository houses;
    private final TournamentRepository tournaments;
    private final RegistrationRepository registrations;

    public TournamentController(GameRepository games, OrganizerRepository organizers, HouseRepository houses,
                                TournamentRepository tournaments, RegistrationRepository registrations) {
        this.games = games;
        this.organizers = organizers;
        this.houses = houses;
        this.tournaments = tournaments;
        this.registrations = registrations;
    }

    @GetMapping("/healthz")
    public HealthStatus health() {
        return new HealthStatus("ok");
    }

    @GetMapping("/games")
    public List<GameView> listGames() {
        return games.findAll().stream().map(this::gameView).toList();
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummary dashboard() {
        Organizer organizer = organizers.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No organizer exists"));
        return summary(organizer);
    }

    @PostMapping("/organizers")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizerView createOrganizer(@Valid @RequestBody OrganizerInput input) {
        String slug = slugify(input.name());
        String initials = input.name().trim().length() > 1
                ? input.name().trim().substring(0, 2).toUpperCase(Locale.ROOT)
                : input.name().trim().toUpperCase(Locale.ROOT);
        return organizerView(organizers.save(new Organizer(input.name().trim(), slug, input.tagline().trim(),
                initials, input.eventDate().trim(), "Live")));
    }

    @PostMapping("/organizers/{organizerId}/houses")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseView createHouse(@PathVariable Long organizerId, @Valid @RequestBody HouseInput input) {
        Organizer organizer = organizer(organizerId);
        return houseView(houses.save(new House(input.name().trim(), input.color().trim(), 0, organizer)));
    }

    @PostMapping("/organizers/{organizerId}/tournaments")
    @ResponseStatus(HttpStatus.CREATED)
    public TournamentView createTournament(@PathVariable Long organizerId, @Valid @RequestBody TournamentInput input) {
        Organizer organizer = organizer(organizerId);
        Game game = games.findById(input.gameId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Game not found"));
        return tournamentView(tournaments.save(new Tournament(input.name().trim(), input.startDate().trim(),
                "Upcoming", organizer, game)));
    }

    @GetMapping("/events/{organizerSlug}")
    public PublicEvent publicEvent(@PathVariable String organizerSlug) {
        return publicEvent(organizer(organizerSlug));
    }

    @PostMapping("/events/{organizerSlug}/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationView register(@PathVariable String organizerSlug,
                                     @Valid @RequestBody RegistrationInput input) {
        Organizer organizer = organizer(organizerSlug);
        House house = houses.findById(input.houseId())
                .filter(candidate -> Objects.equals(candidate.getOrganizer().getId(), organizer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "House not found"));
        Tournament tournament = tournaments.findById(input.tournamentId())
                .filter(candidate -> Objects.equals(candidate.getOrganizer().getId(), organizer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tournament not found"));
        return registrationView(registrations.save(new Registration(input.playerName().trim(), input.email().trim(),
                Instant.now().toString(), organizer, house, tournament)));
    }

    @GetMapping("/events/{organizerSlug}/leaderboard")
    public List<LeaderboardEntry> leaderboard(@PathVariable String organizerSlug) {
        var standings = houses.findByOrganizerOrderByPointsDesc(organizer(organizerSlug)).stream()
                .sorted(Comparator.comparingInt(House::getPoints).reversed())
                .map(house -> houseView(house))
                .toList();
        return IntStream.range(0, standings.size())
                .mapToObj(index -> {
                    var house = standings.get(index);
                    return new LeaderboardEntry(index + 1, house.id(), house.name(), house.color(), house.points(),
                            house.playerCount(), index == 0 ? "up" : "steady");
                })
                .toList();
    }

    private PublicEvent publicEvent(Organizer organizer) {
        return new PublicEvent(organizerView(organizer), listGames(), houseViews(organizer),
                tournaments.findByOrganizerOrderByStartDateAsc(organizer).stream().map(this::tournamentView).toList(),
                recentRegistrations(organizer));
    }

    private DashboardSummary summary(Organizer organizer) {
        return new DashboardSummary(organizerView(organizer), listGames(), houseViews(organizer),
                tournaments.findByOrganizerOrderByStartDateAsc(organizer).stream().map(this::tournamentView).toList(),
                recentRegistrations(organizer));
    }

    private List<HouseView> houseViews(Organizer organizer) {
        return houses.findByOrganizerOrderByPointsDesc(organizer).stream().map(this::houseView).toList();
    }

    private List<RegistrationView> recentRegistrations(Organizer organizer) {
        return registrations.findTop8ByOrganizerOrderByIdDesc(organizer).stream().map(this::registrationView).toList();
    }

    private GameView gameView(Game game) {
        return new GameView(game.getId(), game.getName(), game.getDescription(), game.getRules(),
                game.getMinPlayers(), game.getMaxPlayers(), game.getAccent());
    }

    private OrganizerView organizerView(Organizer organizer) {
        return new OrganizerView(organizer.getId(), organizer.getName(), organizer.getSlug(),
                organizer.getTagline(), organizer.getLogoInitials(), organizer.getEventDate(), organizer.getStatus());
    }

    private HouseView houseView(House house) {
        return new HouseView(house.getId(), house.getName(), house.getColor(), house.getPoints(),
                (int) registrations.countByHouseId(house.getId()));
    }

    private TournamentView tournamentView(Tournament tournament) {
        return new TournamentView(tournament.getId(), tournament.getName(), tournament.getGame().getId(),
                tournament.getGame().getName(), tournament.getStartDate(), tournament.getStatus(),
                (int) registrations.countByTournamentId(tournament.getId()));
    }

    private RegistrationView registrationView(Registration registration) {
        return new RegistrationView(registration.getId(), registration.getPlayerName(), registration.getEmail(),
                registration.getHouse().getId(), registration.getHouse().getName(), registration.getTournament().getId(),
                registration.getTournament().getName(), registration.getRegisteredAt());
    }

    private Organizer organizer(Long id) {
        return organizers.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizer not found"));
    }

    private Organizer organizer(String slug) {
        return organizers.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizer not found"));
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    public record HealthStatus(String status) {}
    public record GameView(Long id, String name, String description, String rules, int minPlayers, int maxPlayers, String accent) {}
    public record OrganizerView(Long id, String name, String slug, String tagline, String logoInitials, String eventDate, String status) {}
    public record HouseView(Long id, String name, String color, int points, int playerCount) {}
    public record TournamentView(Long id, String name, Long gameId, String gameName, String startDate, String status, int registeredPlayers) {}
    public record RegistrationView(Long id, String playerName, String email, Long houseId, String houseName,
                                   Long tournamentId, String tournamentName, String registeredAt) {}
    public record LeaderboardEntry(int rank, Long houseId, String houseName, String color, int points, int playerCount, String trend) {}
    public record DashboardSummary(OrganizerView organizer, List<GameView> games, List<HouseView> houses,
                                   List<TournamentView> tournaments, List<RegistrationView> recentRegistrations) {}
    public record PublicEvent(OrganizerView organizer, List<GameView> games, List<HouseView> houses,
                              List<TournamentView> tournaments, List<RegistrationView> recentRegistrations) {}

    public record OrganizerInput(@NotBlank String name, @NotBlank String tagline, @NotBlank String eventDate) {}
    public record HouseInput(@NotBlank String name, @NotBlank String color) {}
    public record TournamentInput(@NotBlank String name, @Min(1) Long gameId, @NotBlank String startDate) {}
    public record RegistrationInput(@NotBlank String playerName, @Email @NotBlank String email,
                                    @Min(1) Long houseId, @Min(1) Long tournamentId) {}
}