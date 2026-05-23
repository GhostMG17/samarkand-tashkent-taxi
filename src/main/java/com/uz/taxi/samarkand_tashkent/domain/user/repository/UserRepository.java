package com.uz.taxi.samarkand_tashkent.domain.user.repository;

import com.uz.taxi.samarkand_tashkent.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Query("""
            SELECT u FROM User u
            WHERE (CAST(:role AS string) IS NULL OR u.role = :role)
              AND (CAST(:active AS boolean) IS NULL OR u.active = :active)
            """)
    Page<User> searchUsers(
            @Param("role") User.Role role,
            @Param("active") Boolean active,
            Pageable pageable
    );

    long countByRole(User.Role role);

    long countByActive(Boolean active);
}