package com.springboot.TaskO.repository;

import com.springboot.TaskO.model.TeamItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TeamItemRepository extends JpaRepository<TeamItem, UUID> {
    // Additional custom query methods can go here
}