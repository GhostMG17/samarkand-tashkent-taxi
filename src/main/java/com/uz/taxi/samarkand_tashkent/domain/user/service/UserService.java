package com.uz.taxi.samarkand_tashkent.domain.user.service;

import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User save(User user);
    Optional<User> findByPhone(String phone);
    Optional<User> findById(Long id);
    List<User> findAll();
    void deleteById(Long id);
    boolean existsByPhone(String phone);
}