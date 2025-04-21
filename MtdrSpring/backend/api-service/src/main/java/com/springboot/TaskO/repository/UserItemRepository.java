package com.springboot.TaskO.repository;

import com.springboot.TaskO.model.UserItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserItemRepository extends JpaRepository<UserItem, String> {
}