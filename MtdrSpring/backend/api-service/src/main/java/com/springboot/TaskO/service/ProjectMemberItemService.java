package com.springboot.TaskO.service;

import com.springboot.TaskO.model.ProjectMemberItem;
import com.springboot.TaskO.model.UserItem;
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
    public List<ProjectMemberItem> getUserProjects(String userId) {
        return projectMemberItemRepository.findByUserId(userId);
    }
    public ResponseEntity<ProjectMemberItem> getProjectMemberItemById(String id) {
        Optional<ProjectMemberItem> projectData = projectMemberItemRepository.findById(id);
        if (projectData.isPresent()) {
            return new ResponseEntity<>(projectData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    public Boolean checkIfUserExists(String userId) {
        List<ProjectMemberItem> projectMemberItems = projectMemberItemRepository.findAll();
        for (ProjectMemberItem projectMemberItem : projectMemberItems) {
            if (projectMemberItem.getUserId().equals(userId)) {
                return true;
            }
        }
        return false;
    }

    public ProjectMemberItem addProjectItem(ProjectMemberItem projectMemberItem) {
        return projectMemberItemRepository.save(projectMemberItem);
    }
    public ResponseEntity<ProjectMemberItem> addUserToProject( String UserId, UUID projectId, UUID TeamId) {
        ProjectMemberItem projectMemberItem = new ProjectMemberItem();
        projectMemberItem.setTeamId(TeamId);
        projectMemberItem.setUserId(UserId);
        projectMemberItem.setProjectId(projectId);
        projectMemberItemRepository.save(projectMemberItem);
        return new ResponseEntity<>(projectMemberItem, HttpStatus.CREATED);
    }

}