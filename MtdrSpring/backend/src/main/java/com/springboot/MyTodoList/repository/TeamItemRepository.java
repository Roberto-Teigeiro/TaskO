package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TeamItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TeamItemRepository extends JpaRepository<TeamItem, UUID> {
    // Add custom query methods if needed
} 