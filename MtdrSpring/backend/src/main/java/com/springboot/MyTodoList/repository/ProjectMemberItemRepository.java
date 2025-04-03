package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.ProjectMemberItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface ProjectMemberItemRepository extends JpaRepository<ProjectMemberItem, String> {
    @Query("SELECT t FROM TaskItem t WHERE t.taskId = ?1")  
    List<ProjectMemberItem> findByUserId(String USERID);


}