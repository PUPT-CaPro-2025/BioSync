package com.example.biosyncapi.fingerprint;

import com.example.biosyncapi.user.User;
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

    public Fingerprint() {
    }

    public Fingerprint(Long id, String fingerprintURL, User user) {
        this.id = id;
        this.fingerprintURL = fingerprintURL;
        this.user = user;
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

}
