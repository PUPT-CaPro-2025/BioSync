package com.example.biosyncapi.fingerprint;

import com.example.biosyncapi.user.User;
import jakarta.persistence.*;

@Entity
public class Fingerprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "bytea")
    private byte[] fingerprint;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public Fingerprint() {
    }

    public Fingerprint(Long id, byte[] fingerprint, User user) {
        this.id = id;
        this.fingerprint = fingerprint;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public byte[] getFingerprint() { return fingerprint; }

    public void setFingerprint(byte[] fingerprint) { this.fingerprint = fingerprint; }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}
