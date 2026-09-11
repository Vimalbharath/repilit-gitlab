package com.housecup.api.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String rules;
    private int minPlayers;
    private int maxPlayers;
    private String accent;

    protected Game() {}

    public Game(String name, String description, String rules, int minPlayers, int maxPlayers, String accent) {
        this.name = name;
        this.description = description;
        this.rules = rules;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.accent = accent;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getRules() { return rules; }
    public int getMinPlayers() { return minPlayers; }
    public int getMaxPlayers() { return maxPlayers; }
    public String getAccent() { return accent; }
}