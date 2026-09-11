package com.housecup.api.repository;

import com.housecup.api.domain.Organizer;
import com.housecup.api.domain.Tournament;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByOrganizerOrderByStartDateAsc(Organizer organizer);
}