package com.example.biosyncapi.user.profile_image;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileImageRepository
    extends JpaRepository<ProfileImage, Long>
{
  ProfileImage findByUserId(Long userId);

  @Transactional
  void deleteByUserId(Long userId);
}
