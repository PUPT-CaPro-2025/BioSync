package com.example.biosyncapi.authentication;

import com.example.biosyncapi.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

  private final UserRepository userRepository;

  public UserDetailsServiceImpl(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String usercode)
      throws UsernameNotFoundException
  {
    return userRepository.findByUsercode(usercode)
        .orElseThrow(
            () -> new UsernameNotFoundException(usercode + " not found"));
  }
}
