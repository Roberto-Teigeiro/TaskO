package com.springboot.TaskO.repository;

import com.springboot.TaskO.model.TeamItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface TeamItemRepository extends JpaRepository<TeamItem, UUID> {
    // Method to find TeamItems by projectId
    List<TeamItem> findByProjectId(UUID projectId);

    // Additional custom query methods can go here
}