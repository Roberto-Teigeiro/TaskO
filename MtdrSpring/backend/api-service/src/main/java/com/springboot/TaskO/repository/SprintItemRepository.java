package com.springboot.TaskO.repository;

import com.springboot.TaskO.model.SprintItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SprintItemRepository extends JpaRepository<SprintItem, UUID> {
}