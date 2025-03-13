package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.SprintItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SprintItemRepository extends JpaRepository<SprintItem, UUID> {
}