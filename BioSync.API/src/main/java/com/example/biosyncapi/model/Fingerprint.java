package com.example.biosyncapi.model;

import jakarta.persistence.*;

@Entity
public class Fingerprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fingerprintURL;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    private Long sectionId;

    public Fingerprint() {
    }

    public Fingerprint(Long id, String fingerprintURL, User user, Long sectionId) {
        this.id = id;
        this.fingerprintURL = fingerprintURL;
        this.user = user;
        this.sectionId = sectionId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFingerprintURL() {
        return fingerprintURL;
    }

    public void setFingerprintURL(String fingerprintURL) {
        this.fingerprintURL = fingerprintURL;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }
}
