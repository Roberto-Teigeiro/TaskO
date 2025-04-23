package com.springboot.TaskO.repository;

import com.springboot.TaskO.model.SprintItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SprintItemRepository extends JpaRepository<SprintItem, UUID> {
    @Query("SELECT t FROM SprintItem t WHERE t.projectId = ?1")    
    List<SprintItem> findByProjectId(UUID projectId);

}