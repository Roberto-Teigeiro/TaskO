package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SprintItem;
import com.springboot.MyTodoList.repository.SprintItemRepository;
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

    public ResponseEntity<SprintItem> getItemById(UUID id) {
        Optional<SprintItem> todoData = sprintItemRepository.findById(id);
        if (todoData.isPresent()) {
            return new ResponseEntity<>(todoData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public SprintItem addSprintItem(SprintItem sprintItem) {
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