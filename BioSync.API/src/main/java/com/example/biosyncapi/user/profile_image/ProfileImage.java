package com.example.biosyncapi.user.profile_image;

import com.example.biosyncapi.user.User;
import jakarta.persistence.*;

@Entity
public class ProfileImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ProfileImage() {}

    public ProfileImage(String imageUrl, User user) {
        this.imageUrl = imageUrl;
        this.user = user;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }
    
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
