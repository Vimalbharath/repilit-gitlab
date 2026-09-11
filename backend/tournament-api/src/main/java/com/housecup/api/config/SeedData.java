package com.housecup.api.config;

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
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedData {
    @Bean
    CommandLineRunner seed(GameRepository games, OrganizerRepository organizers, HouseRepository houses,
                           TournamentRepository tournaments, RegistrationRepository registrations) {
        return args -> {
            if (games.count() > 0) return;
            var kabaddi = games.save(new Game("Kabaddi", "Fast, tactical team combat.", "Two halves, raid and defend.", 7, 12, "saffron"));
            var chess = games.save(new Game("Chess", "Quiet focus, decisive moves.", "Swiss rounds with timed matches.", 1, 2, "indigo"));
            var khoKho = games.save(new Game("Kho-Kho", "Speed, strategy, and sharp turns.", "Chasers rotate after each touch.", 9, 12, "mint"));
            var cricket = games.save(new Game("Cricket", "The classic everyone gathers for.", "Short-format matches to 6 overs.", 11, 15, "coral"));
            var organizer = organizers.save(new Organizer("St. Xavier's Annual Meet", "st-xaviers-annual-meet",
                    "Where every house brings its best.", "SX", "2026-09-18", "Live"));
            var red = houses.save(new House("House Orion", "#F1A33B", 1280, organizer));
            var blue = houses.save(new House("House Atlas", "#5878DB", 1140, organizer));
            var green = houses.save(new House("House Verdant", "#4BAA88", 960, organizer));
            var tournament = tournaments.save(new Tournament("Inter-house Kabaddi", "2026-09-18", "Open", organizer, kabaddi));
            tournaments.save(new Tournament("Rapid Chess Cup", "2026-09-19", "Upcoming", organizer, chess));
            registrations.saveAll(List.of(
                    new Registration("Aarav Mehta", "aarav@example.com", "2026-08-14T09:30:00Z", organizer, red, tournament),
                    new Registration("Mira Rao", "mira@example.com", "2026-08-13T16:12:00Z", organizer, blue, tournament),
                    new Registration("Kabir Shah", "kabir@example.com", "2026-08-13T14:02:00Z", organizer, green, tournament)
            ));
        };
    }
}