package com.springboot.TaskO.service;

import com.springboot.TaskO.model.ProjectMemberItem;
import com.springboot.TaskO.repository.ProjectMemberItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectMemberItemService {

    @Autowired
    private ProjectMemberItemRepository projectMemberItemRepository;

    public List<ProjectMemberItem> findAll() {
        return projectMemberItemRepository.findAll();
    }

    public List<ProjectMemberItem> findByProjectId(UUID projectId) {
        return projectMemberItemRepository.findByProjectId(projectId);
    }

    public ResponseEntity<ProjectMemberItem> getProjectMemberItemById(String userId) {
        List<ProjectMemberItem> members = projectMemberItemRepository.findByUserId(userId);
        if (!members.isEmpty()) {
            return new ResponseEntity<>(members.get(0), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public Boolean checkIfUserExists(String userId) {
        List<ProjectMemberItem> members = projectMemberItemRepository.findByUserId(userId);
        return !members.isEmpty();
    }

    public ProjectMemberItem addProjectItem(ProjectMemberItem projectMemberItem) {
        try {
            // Check if the member already exists
            boolean exists = projectMemberItemRepository.existsByProjectIdAndUserId(
                projectMemberItem.getProjectId(), 
                projectMemberItem.getUserId()
            );
            
            if (exists) {
                throw new RuntimeException("User is already a member of this project");
            }
            
            return projectMemberItemRepository.save(projectMemberItem);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add project member: " + e.getMessage());
        }
    }
}