package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.ProjectItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectItemRepository extends JpaRepository<ProjectItem, UUID> {
}