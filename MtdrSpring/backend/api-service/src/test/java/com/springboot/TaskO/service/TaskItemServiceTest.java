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

import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.repository.TaskItemRepository;

@ExtendWith(MockitoExtension.class)
public class TaskItemServiceTest {

    @Mock
    private TaskItemRepository taskItemRepository;

    @InjectMocks
    private TaskItemService taskItemService;

    private TaskItem testTask;
    private UUID testTaskId;
    private UUID testSprintId;

    @BeforeEach
    void setUp() {
        testTaskId = UUID.randomUUID();
        testSprintId = UUID.randomUUID();
        testTask = new TaskItem();
        testTask.setId(testTaskId);
        testTask.setTitle("Test Task");
        testTask.setDescription("Test Description");
        testTask.setSprintId(testSprintId);
    }

    @Test
    void findAll_ShouldReturnAllTasks() {
        List<TaskItem> expectedTasks = Arrays.asList(testTask);
        when(taskItemRepository.findAll()).thenReturn(expectedTasks);

        List<TaskItem> actualTasks = taskItemService.findAll();

        assertEquals(expectedTasks, actualTasks);
        verify(taskItemRepository).findAll();
    }

    @Test
    void findAllBySprintId_ShouldReturnTasks() {
        List<TaskItem> expectedTasks = Arrays.asList(testTask);
        when(taskItemRepository.findBySprintId(testSprintId)).thenReturn(expectedTasks);

        List<TaskItem> actualTasks = taskItemService.findAllBySprintId(testSprintId);

        assertEquals(expectedTasks, actualTasks);
        verify(taskItemRepository).findBySprintId(testSprintId);
    }

    @Test
    void getItemById_WhenTaskExists_ShouldReturnTask() {
        when(taskItemRepository.findById(testTaskId)).thenReturn(Optional.of(testTask));

        ResponseEntity<TaskItem> response = taskItemService.getItemById(testTaskId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testTask, response.getBody());
        verify(taskItemRepository).findById(testTaskId);
    }

    @Test
    void getItemById_WhenTaskDoesNotExist_ShouldReturnNotFound() {
        when(taskItemRepository.findById(testTaskId)).thenReturn(Optional.empty());

        ResponseEntity<TaskItem> response = taskItemService.getItemById(testTaskId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(taskItemRepository).findById(testTaskId);
    }

    @Test
    void addTaskItem_ShouldSaveAndReturnTask() {
        when(taskItemRepository.save(any(TaskItem.class))).thenReturn(testTask);

        TaskItem savedTask = taskItemService.addTaskItem(testTask);

        assertEquals(testTask, savedTask);
        verify(taskItemRepository).save(testTask);
    }

    @Test
    void updateTaskItem_WhenTaskExists_ShouldUpdateAndReturnTask() {
        when(taskItemRepository.findById(testTaskId)).thenReturn(Optional.of(testTask));
        when(taskItemRepository.save(any(TaskItem.class))).thenReturn(testTask);

        TaskItem updatedTask = taskItemService.updateTaskItem(testTaskId, testTask);

        assertEquals(testTask, updatedTask);
        verify(taskItemRepository).findById(testTaskId);
        verify(taskItemRepository).save(testTask);
    }

    @Test
    void updateTaskItem_WhenTaskDoesNotExist_ShouldReturnNull() {
        when(taskItemRepository.findById(testTaskId)).thenReturn(Optional.empty());

        TaskItem updatedTask = taskItemService.updateTaskItem(testTaskId, testTask);

        assertNull(updatedTask);
        verify(taskItemRepository).findById(testTaskId);
        verify(taskItemRepository, never()).save(any(TaskItem.class));
    }

    @Test
    void deleteTaskItem_WhenTaskExists_ShouldDeleteAndReturnTrue() {
        doNothing().when(taskItemRepository).deleteById(testTaskId);

        boolean result = taskItemService.deleteTaskItem(testTaskId);

        assertTrue(result);
        verify(taskItemRepository).deleteById(testTaskId);
    }

    @Test
    void deleteTaskItem_WhenTaskDoesNotExist_ShouldReturnFalse() {
        doThrow(new RuntimeException("Not found")).when(taskItemRepository).deleteById(testTaskId);

        boolean result = taskItemService.deleteTaskItem(testTaskId);

        assertFalse(result);
        verify(taskItemRepository).deleteById(testTaskId);
    }
} 