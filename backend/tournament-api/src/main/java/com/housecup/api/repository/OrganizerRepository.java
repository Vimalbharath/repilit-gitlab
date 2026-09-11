package com.housecup.api.repository;

import com.housecup.api.domain.Organizer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizerRepository extends JpaRepository<Organizer, Long> {
    Optional<Organizer> findBySlug(String slug);
}