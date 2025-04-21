package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.ProjectMemberItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectMemberItemRepository extends JpaRepository<ProjectMemberItem, ProjectMemberItem.ProjectMemberKey> {
    List<ProjectMemberItem> findByProjectId(UUID projectId);
    List<ProjectMemberItem> findByUserId(String userId);
    boolean existsByProjectIdAndUserId(UUID projectId, String userId);
}