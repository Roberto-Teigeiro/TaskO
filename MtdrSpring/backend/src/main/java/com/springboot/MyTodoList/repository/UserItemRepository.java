package com.springboot.MyTodoList.repository;

import java.util.List;
import java.util.UUID;

import com.springboot.MyTodoList.model.TaskItem;
import com.springboot.MyTodoList.model.UserItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface UserItemRepository extends JpaRepository<UserItem, String> {
    @Query("SELECT t FROM UserItem t WHERE t.telegramUsername = ?1")  
    List<UserItem> findByTelegramUsername(String telegramUsername);
}