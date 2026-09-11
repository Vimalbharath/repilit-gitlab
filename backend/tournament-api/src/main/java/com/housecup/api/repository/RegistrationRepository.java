package com.housecup.api.repository;

import com.housecup.api.domain.Organizer;
import com.housecup.api.domain.Registration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findTop8ByOrganizerOrderByIdDesc(Organizer organizer);
    long countByTournamentId(Long tournamentId);
    long countByHouseId(Long houseId);
}