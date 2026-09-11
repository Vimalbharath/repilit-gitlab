package com.housecup.api.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "organizers")
public class Organizer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String slug;
    private String tagline;
    private String logoInitials;
    private String eventDate;
    private String status;

    protected Organizer() {}

    public Organizer(String name, String slug, String tagline, String logoInitials, String eventDate, String status) {
        this.name = name;
        this.slug = slug;
        this.tagline = tagline;
        this.logoInitials = logoInitials;
        this.eventDate = eventDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getTagline() { return tagline; }
    public String getLogoInitials() { return logoInitials; }
    public String getEventDate() { return eventDate; }
    public String getStatus() { return status; }
}