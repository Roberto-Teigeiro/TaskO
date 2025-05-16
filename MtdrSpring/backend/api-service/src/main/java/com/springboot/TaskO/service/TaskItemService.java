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

    public List<TaskItem> findAllBySprintId(UUID sprintId) {
        List<TaskItem> todoItems = toDoItemRepository.findBySprintId(sprintId);
        return todoItems;
    }

    public TaskItem updateTaskItem(UUID id, TaskItem t) {
        Optional<TaskItem> toDoItemData = toDoItemRepository.findById(id);
        if (toDoItemData.isPresent()) {
            TaskItem toDoItem = toDoItemData.get();
            System.out.println("Updating task: " + id);
            System.out.println("Current task state: " + toDoItem);
            System.out.println("Update request: " + t);
            System.out.println("realHours in update request: " + t.getRealHours());
            
            // Only update fields that are not null in the input object
            if (t.getSprintId() != null) {
                toDoItem.setSprintId(t.getSprintId());
            }
            if (t.getStatus() != null) {
                toDoItem.setStatus(t.getStatus());
            }
            if (t.getEndDate() != null) {
                toDoItem.setEndDate(t.getEndDate());
            }
            if (t.getComments() != null) {
                toDoItem.setComments(t.getComments());
            }
            if (t.getAssignee() != null) {
                toDoItem.setAssignee(t.getAssignee());
            }
            if (t.getRealHours() != null) {
                System.out.println("Updating realHours from " + toDoItem.getRealHours() + " to " + t.getRealHours());
                toDoItem.setRealHours(t.getRealHours());
                System.out.println("realHours after set: " + toDoItem.getRealHours());
            } else {
                System.out.println("realHours is null in update request");
            }
            if (t.getEstimatedHours() != null) {
                toDoItem.setEstimatedHours(t.getEstimatedHours());
            }
            
            TaskItem savedTask = toDoItemRepository.save(toDoItem);
            System.out.println("Updated task state: " + savedTask);
            System.out.println("realHours in saved task: " + savedTask.getRealHours());
            return savedTask;
        } else {
            System.out.println("Task not found: " + id);
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
