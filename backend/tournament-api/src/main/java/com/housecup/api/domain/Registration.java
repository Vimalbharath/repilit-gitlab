package com.housecup.api.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "registrations")
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String playerName;
    private String email;
    private String registeredAt;

    @ManyToOne
    @JoinColumn(name = "organizer_id", nullable = false)
    private Organizer organizer;

    @ManyToOne
    @JoinColumn(name = "house_id", nullable = false)
    private House house;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    protected Registration() {}

    public Registration(String playerName, String email, String registeredAt, Organizer organizer, House house, Tournament tournament) {
        this.playerName = playerName;
        this.email = email;
        this.registeredAt = registeredAt;
        this.organizer = organizer;
        this.house = house;
        this.tournament = tournament;
    }

    public Long getId() { return id; }
    public String getPlayerName() { return playerName; }
    public String getEmail() { return email; }
    public String getRegisteredAt() { return registeredAt; }
    public Organizer getOrganizer() { return organizer; }
    public House getHouse() { return house; }
    public Tournament getTournament() { return tournament; }
}