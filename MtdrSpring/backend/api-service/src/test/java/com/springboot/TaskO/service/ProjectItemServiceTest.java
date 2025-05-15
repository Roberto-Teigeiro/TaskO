package com.springboot.TaskO.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.springboot.TaskO.model.ProjectItem;
import com.springboot.TaskO.repository.ProjectItemRepository;

@ExtendWith(MockitoExtension.class)
public class ProjectItemServiceTest {

    @Mock
    private ProjectItemRepository projectItemRepository;

    @InjectMocks
    private ProjectItemService projectItemService;

    private ProjectItem testProject;
    private UUID testProjectId;

    @BeforeEach
    void setUp() {
        testProjectId = UUID.randomUUID();
        testProject = new ProjectItem();
        testProject.setProjectId(testProjectId);
        testProject.setProjectName("Test Project");
        testProject.setDescription("Test Description");
    }

    @Test
    void findAll_ShouldReturnAllProjects() {
        List<ProjectItem> expectedProjects = Arrays.asList(testProject);
        when(projectItemRepository.findAll()).thenReturn(expectedProjects);

        List<ProjectItem> actualProjects = projectItemService.findAll();

        assertEquals(expectedProjects, actualProjects);
        verify(projectItemRepository).findAll();
    }

    @Test
    void getItemById_WhenProjectExists_ShouldReturnProject() {
        when(projectItemRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));

        ResponseEntity<ProjectItem> response = projectItemService.getItemById(testProjectId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testProject, response.getBody());
        verify(projectItemRepository).findById(testProjectId);
    }

    @Test
    void getItemById_WhenProjectDoesNotExist_ShouldReturnNotFound() {
        when(projectItemRepository.findById(testProjectId)).thenReturn(Optional.empty());

        ResponseEntity<ProjectItem> response = projectItemService.getItemById(testProjectId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(projectItemRepository).findById(testProjectId);
    }

    @Test
    void addProjectItem_ShouldSaveAndReturnProject() {
        when(projectItemRepository.save(any(ProjectItem.class))).thenReturn(testProject);

        ProjectItem savedProject = projectItemService.addProjectItem(testProject);

        assertEquals(testProject, savedProject);
        verify(projectItemRepository).save(testProject);
    }

    @Test
    void addProjectItem_WhenRepositoryThrowsException_ShouldPropagateException() {
        when(projectItemRepository.save(any(ProjectItem.class)))
                .thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> projectItemService.addProjectItem(testProject));
        verify(projectItemRepository).save(testProject);
    }
} 