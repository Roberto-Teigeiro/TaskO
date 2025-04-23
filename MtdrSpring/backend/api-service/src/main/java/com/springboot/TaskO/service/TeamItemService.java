package com.springboot.TaskO.service;

import com.springboot.TaskO.model.TeamItem;
import com.springboot.TaskO.repository.TeamItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Service
public class TeamItemService {

    @Autowired
    private TeamItemRepository teamItemRepository;

    public List<TeamItem> findAll() {
        return teamItemRepository.findAll();
    }

    public ResponseEntity<TeamItem> getTeamItemById(UUID id) {
        Optional<TeamItem> teamData = teamItemRepository.findById(id);
        if (teamData.isPresent()) {
            return new ResponseEntity<>(teamData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public TeamItem addTeamItem(TeamItem teamItem) {
        return teamItemRepository.save(teamItem);
    }
}