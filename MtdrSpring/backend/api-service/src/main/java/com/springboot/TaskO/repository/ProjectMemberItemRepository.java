package com.springboot.TaskO.repository;

import com.springboot.TaskO.model.ProjectMemberItem;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface ProjectMemberItemRepository extends JpaRepository<ProjectMemberItem, String> {
    @Query("SELECT p FROM ProjectMemberItem p WHERE p.userId = ?1")  
    List<ProjectMemberItem> findByUserId(String userId);
    
    @Query("SELECT p.projectId FROM ProjectMemberItem p WHERE p.userId = ?1")
    List<UUID> findProjectIdsByUserId(String userId);

    @Query("SELECT p FROM ProjectMemberItem p WHERE p.projectId = ?1")
    List<ProjectMemberItem> findByProjectId(UUID projectId);

}