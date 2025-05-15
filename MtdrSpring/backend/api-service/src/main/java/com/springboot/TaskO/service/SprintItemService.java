package com.springboot.TaskO.service;

import com.springboot.TaskO.model.SprintItem;
import com.springboot.TaskO.repository.SprintItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SprintItemService {

    @Autowired
    private SprintItemRepository sprintItemRepository;

    public List<SprintItem> findAll() {
        return sprintItemRepository.findAll();
    }

    public ResponseEntity<List<SprintItem>> getItemsByProjectId(UUID projectId) {
        try {
            List<SprintItem> items = sprintItemRepository.findByProjectId(projectId);
            if (!items.isEmpty()) {
                return new ResponseEntity<>(items, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public SprintItem addSprintItem(SprintItem sprintItem) throws RuntimeException {
        return sprintItemRepository.save(sprintItem);
    }

    public boolean deleteSprintItem(UUID id) {
        try {
            sprintItemRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Test method to check database connectivity
    public void testDatabaseConnection() {
        try {
            List<SprintItem> items = sprintItemRepository.findAll();
            System.out.println("Database connection successful. Number of items: " + items.size());
        } catch (Exception e) {
            System.err.println("Database connection failed: " + e.getMessage());
        }
    }
}