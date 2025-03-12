package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SprintItem;
import com.springboot.MyTodoList.repository.SprintItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Service
public class SprintItemService {

    @Autowired
    private SprintItemRepository sprintItemRepository;
    public List<SprintItem> findAll(){
        List<SprintItem> SprintItem = sprintItemRepository.findAll();
        return SprintItem;
    }
    public ResponseEntity<SprintItem> getItemById(UUID id){
        Optional<SprintItem> todoData = sprintItemRepository.findById(id);
        if (todoData.isPresent()){
            return new ResponseEntity<>(todoData.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    public SprintItem addSprintItem(SprintItem sprintItem){
        return sprintItemRepository.save(sprintItem);
    }

    public boolean deleteSprintItem(UUID id){
        try{
            sprintItemRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
    //public SprintItem updateSprintItem(UUID id, SprintItem td){
      //  Optional<SprintItem> sprintItemData = sprintItemRepository.findById(id);
        //if(sprintItemData.isPresent()){
          //  SprintItem sprintItem; = sprintItemData.get();
            //SprintItem.setID(id);
            //SprintItem.setCreation_ts(td.getCreation_ts());
            //SprintItem.setDescription(td.getDescription());
            //SprintItem.setDone(td.isDone());
            //return SprintItem;Repository.save(SprintItem;);
        //}else{
          //  return null;
        //}
    //}

}
