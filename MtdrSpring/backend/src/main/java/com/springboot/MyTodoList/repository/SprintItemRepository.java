package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.SprintItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.transaction.Transactional;
import java.util.UUID;

@Repository
@Transactional
@EnableTransactionManagement
public interface SprintItemRepository extends JpaRepository<SprintItem, UUID> {
}