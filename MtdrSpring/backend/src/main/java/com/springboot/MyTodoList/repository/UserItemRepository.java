package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.UserItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserItemRepository extends JpaRepository<UserItem, String> {
}