package com.springboot.TaskO.service;

import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.repository.TaskItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Service
public class TaskItemService {

    @Autowired
    private TaskItemRepository toDoItemRepository;
    public List<TaskItem> findAll(){
        List<TaskItem> todoItems = toDoItemRepository.findAll();
        return todoItems;
    }
    public ResponseEntity<TaskItem> getItemById(UUID id){
        Optional<TaskItem> todoData = toDoItemRepository.findById(id);
        if (todoData.isPresent()){
            return new ResponseEntity<>(todoData.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    public TaskItem addTaskItem(TaskItem toDoItem){
        return toDoItemRepository.save(toDoItem);
    }

    public boolean deleteTaskItem(UUID id){
        try{
            toDoItemRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    public List<TaskItem> getTaskItemsByAssignee(String assignee) {
        List<TaskItem> tasks = toDoItemRepository.findByAssignee(assignee);
        if (tasks.isEmpty()) {
            return null; // or throw an exception if you prefer
        } else {
            return tasks;
        }
    }

    public TaskItem updateTaskItem(UUID id, TaskItem t){
        Optional<TaskItem> toDoItemData = toDoItemRepository.findById(id);
        if(toDoItemData.isPresent()){
            TaskItem toDoItem = toDoItemData.get();
            // Solo actualiza los campos necesarios, NO cambies assignee
            toDoItem.setSprintId(t.getSprintId());
            toDoItem.setStatus(t.getStatus());
            toDoItem.setEndDate(t.getEndDate());
            toDoItem.setComments(t.getComments());
            return toDoItemRepository.save(toDoItem);
        }else{
            return null;
        }
    }

    public List<TaskItem> getTaskItemsByTaskId(UUID taskId) {
        List<TaskItem> tasks = toDoItemRepository.findByTaskId(taskId);
        if (tasks.isEmpty()) {
            return null; // or throw an exception if you prefer
        } else {
            return tasks;
        }
    }

}
