package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.ProjectItem;
import com.springboot.MyTodoList.repository.ProjectItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectItemService {

    @Autowired
    private ProjectItemRepository projectItemRepository;

    public List<ProjectItem> findAll() {
        return projectItemRepository.findAll();
    }

    public ResponseEntity<ProjectItem> getItemById(UUID id) {
        Optional<ProjectItem> projectData = projectItemRepository.findById(id);
        if (projectData.isPresent()) {
            return new ResponseEntity<>(projectData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public ProjectItem addProjectItem(ProjectItem projectItem) {
        projectItem.setProjectId(UUID.randomUUID());
        projectItem.setProjectName(projectItem.getProjectName());
        return projectItemRepository.save(projectItem);
    }

    public boolean deleteProjectItem(UUID id) {
        try {
            projectItemRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}