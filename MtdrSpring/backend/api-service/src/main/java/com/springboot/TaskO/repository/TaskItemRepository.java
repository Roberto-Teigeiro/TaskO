package com.springboot.TaskO.repository;


import com.springboot.TaskO.model.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.transaction.Transactional;

@Repository
@Transactional
@EnableTransactionManagement
public interface TaskItemRepository extends JpaRepository<TaskItem,UUID> {

    @Query("SELECT t FROM TaskItem t WHERE t.taskId = ?1")  
    List<TaskItem> findByTaskId(UUID taskId);

    @Query("SELECT t FROM TaskItem t WHERE t.startDate = ?1")
    List<TaskItem> findByStartDate(OffsetDateTime startDate);


    @Query("SELECT t FROM TaskItem t WHERE t.assignee = ?1")
    List<TaskItem> findByAssignee(String assignee);
    
}
