package com.housecup.api.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String startDate;
    private String status;

    @ManyToOne
    @JoinColumn(name = "organizer_id", nullable = false)
    private Organizer organizer;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    protected Tournament() {}

    public Tournament(String name, String startDate, String status, Organizer organizer, Game game) {
        this.name = name;
        this.startDate = startDate;
        this.status = status;
        this.organizer = organizer;
        this.game = game;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getStartDate() { return startDate; }
    public String getStatus() { return status; }
    public Organizer getOrganizer() { return organizer; }
    public Game getGame() { return game; }
}