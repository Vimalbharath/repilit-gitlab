package com.housecup.api.repository;

import com.housecup.api.domain.House;
import com.housecup.api.domain.Organizer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseRepository extends JpaRepository<House, Long> {
    List<House> findByOrganizerOrderByPointsDesc(Organizer organizer);
}