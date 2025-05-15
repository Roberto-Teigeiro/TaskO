package com.springboot.TaskO.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.springboot.TaskO.model.SprintItem;
import com.springboot.TaskO.repository.SprintItemRepository;

@ExtendWith(MockitoExtension.class)
public class SprintItemServiceTest {

    @Mock
    private SprintItemRepository sprintItemRepository;

    @InjectMocks
    private SprintItemService sprintItemService;

    private SprintItem testSprint;
    private UUID testSprintId;
    private UUID testProjectId;

    @BeforeEach
    void setUp() {
        testSprintId = UUID.randomUUID();
        testProjectId = UUID.randomUUID();
        testSprint = new SprintItem();
        testSprint.setSprintId(testSprintId);
        testSprint.setProjectId(testProjectId);
        testSprint.setSprintName("Test Sprint");
        testSprint.setDescription("Test Description");
    }

    @Test
    void findAll_ShouldReturnAllSprints() {
        List<SprintItem> expectedSprints = Arrays.asList(testSprint);
        when(sprintItemRepository.findAll()).thenReturn(expectedSprints);

        List<SprintItem> actualSprints = sprintItemService.findAll();

        assertEquals(expectedSprints, actualSprints);
        verify(sprintItemRepository).findAll();
    }

    @Test
    void getItemsByProjectId_WhenSprintsExist_ShouldReturnSprints() {
        List<SprintItem> expectedSprints = Arrays.asList(testSprint);
        when(sprintItemRepository.findByProjectId(testProjectId)).thenReturn(expectedSprints);

        ResponseEntity<List<SprintItem>> response = sprintItemService.getItemsByProjectId(testProjectId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedSprints, response.getBody());
        verify(sprintItemRepository).findByProjectId(testProjectId);
    }

    @Test
    void getItemsByProjectId_WhenNoSprintsExist_ShouldReturnNotFound() {
        when(sprintItemRepository.findByProjectId(testProjectId)).thenReturn(Collections.emptyList());

        ResponseEntity<List<SprintItem>> response = sprintItemService.getItemsByProjectId(testProjectId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(sprintItemRepository).findByProjectId(testProjectId);
    }

    @Test
    void getItemsByProjectId_WhenRepositoryThrowsException_ShouldReturn500() {
        when(sprintItemRepository.findByProjectId(testProjectId))
                .thenThrow(new RuntimeException("Database error"));

        ResponseEntity<List<SprintItem>> response = sprintItemService.getItemsByProjectId(testProjectId);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void addSprintItem_ShouldSaveAndReturnSprint() {
        when(sprintItemRepository.save(any(SprintItem.class))).thenReturn(testSprint);

        SprintItem savedSprint = sprintItemService.addSprintItem(testSprint);

        assertEquals(testSprint, savedSprint);
        verify(sprintItemRepository).save(testSprint);
    }

    @Test
    void addSprintItem_WhenRepositoryThrowsException_ShouldPropagateException() {
        when(sprintItemRepository.save(any(SprintItem.class)))
                .thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> sprintItemService.addSprintItem(testSprint));
        verify(sprintItemRepository).save(testSprint);
    }
} 