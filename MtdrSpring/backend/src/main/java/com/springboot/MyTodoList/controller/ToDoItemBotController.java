package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.TaskItem;
import com.springboot.MyTodoList.service.TaskItemService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;

public class ToDoItemBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    private TaskItemService taskItemService;
    private String botName;

    public ToDoItemBotController(String botToken, String botName, TaskItemService taskItemService) {
        super(botToken);
        logger.info("Bot Token: " + botToken);
        logger.info("Bot name: " + botName);
        this.taskItemService = taskItemService;
        this.botName = botName;
    }

    @Override
    public void onUpdateReceived(Update update) {

        if (update.hasMessage() && update.getMessage().hasText()) {

            String messageTextFromTelegram = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {

                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText(BotMessages.HELLO_MYTODO_BOT.getMessage());

                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                // first row
                KeyboardRow row = new KeyboardRow();
                row.add(BotLabels.LIST_ALL_ITEMS.getLabel());
                row.add(BotLabels.ADD_NEW_ITEM.getLabel());
                // Add the first row to the keyboard
                keyboard.add(row);

                // second row
                row = new KeyboardRow();
                row.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                row.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
                keyboard.add(row);

                // Set the keyboard
                keyboardMarkup.setKeyboard(keyboard);

                // Add the keyboard markup
                messageToTelegram.setReplyMarkup(keyboardMarkup);

                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } 
            // 1. First update - where you're marking an item as DONE
            else if (messageTextFromTelegram.indexOf(BotLabels.DONE.getLabel()) != -1) {
                String done = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                UUID id = UUID.fromString(done);

                try {
                    TaskItem item = getTaskItemById(id).getBody();
                    item.setStatus(TaskItem.Status.COMPLETED); // Changed from "DONE" string to enum
                    updateTaskItem(item, id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), this);
                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            } 
            // 2. Second update - where you're marking an item as TODO (undoing)
            else if (messageTextFromTelegram.indexOf(BotLabels.UNDO.getLabel()) != -1) {
                String undo = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                UUID id = UUID.fromString(undo);

                try {
                    TaskItem item = getTaskItemById(id).getBody();
                    item.setStatus(TaskItem.Status.TODO); // Changed from "TODO" string to enum
                    updateTaskItem(item, id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), this);
                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            } else if (messageTextFromTelegram.indexOf(BotLabels.DELETE.getLabel()) != -1) {

                String delete = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                UUID id = UUID.fromString(delete);

                try {
                    deleteTaskItem(id).getBody();
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), this);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {

                BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);

            } else if (messageTextFromTelegram.equals(BotCommands.TODO_LIST.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                    || messageTextFromTelegram.equals(BotLabels.MY_TODO_LIST.getLabel())) {

                List<TaskItem> allItems = getAllTaskItems();
                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                // command back to main screen
                KeyboardRow mainScreenRowTop = new KeyboardRow();
                mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                keyboard.add(mainScreenRowTop);

                KeyboardRow firstRow = new KeyboardRow();
                firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
                keyboard.add(firstRow);

                KeyboardRow myTodoListTitleRow = new KeyboardRow();
                myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
                keyboard.add(myTodoListTitleRow);

                // 3. Third update - filtering active items
                List<TaskItem> activeItems = allItems.stream()
                    .filter(item -> item.getStatus() != TaskItem.Status.COMPLETED) // Changed from string comparison
                    .collect(Collectors.toList());

                for (TaskItem item : activeItems) {
                    KeyboardRow currentRow = new KeyboardRow();
                    currentRow.add(item.getDescription());
                    currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
                    keyboard.add(currentRow);
                }

                // 4. Fourth update - filtering done items
                List<TaskItem> doneItems = allItems.stream()
                    .filter(item -> item.getStatus() == TaskItem.Status.COMPLETED) // Changed from string comparison
                    .collect(Collectors.toList());

                for (TaskItem item : doneItems) {
                    KeyboardRow currentRow = new KeyboardRow();
                    currentRow.add(item.getDescription());
                    currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
                    currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
                    keyboard.add(currentRow);
                }

                // command back to main screen
                KeyboardRow mainScreenRowBottom = new KeyboardRow();
                mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                keyboard.add(mainScreenRowBottom);

                keyboardMarkup.setKeyboard(keyboard);

                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText(BotLabels.MY_TODO_LIST.getLabel());
                messageToTelegram.setReplyMarkup(keyboardMarkup);

                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.equals(BotCommands.ADD_ITEM.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.ADD_NEW_ITEM.getLabel())) {
                try {
                    SendMessage messageToTelegram = new SendMessage();
                    messageToTelegram.setChatId(chatId);
                    messageToTelegram.setText(BotMessages.TYPE_NEW_TODO_ITEM.getMessage());
                    // hide keyboard
                    ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
                    messageToTelegram.setReplyMarkup(keyboardMarkup);

                    // send message
                    execute(messageToTelegram);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            }

            // 5. Fifth update - creating a new item
            else {
                try {
                    TaskItem newItem = new TaskItem();
                    newItem.setDescription(messageTextFromTelegram);
                    newItem.setStartDate(OffsetDateTime.now());
                    newItem.setStatus(TaskItem.Status.TODO); // Changed from "TODO" string to enum
                    ResponseEntity entity = addTaskItem(newItem);

                    SendMessage messageToTelegram = new SendMessage();
                    messageToTelegram.setChatId(chatId);
                    messageToTelegram.setText(BotMessages.NEW_ITEM_ADDED.getMessage());

                    execute(messageToTelegram);
                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            }
        }
    }

    @Override
    public String getBotUsername() {		
        return botName;
    }

    // GET /todolist
    public List<TaskItem> getAllTaskItems() { 
        return taskItemService.findAll();
    }

    // GET BY ID /todolist/{id}
    public ResponseEntity<TaskItem> getTaskItemById(@PathVariable UUID id) {
        try {
            ResponseEntity<TaskItem> responseEntity = taskItemService.getItemById(id);
            return new ResponseEntity<TaskItem>(responseEntity.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // PUT /todolist
    public ResponseEntity addTaskItem(@RequestBody TaskItem taskItem) throws Exception {
        TaskItem td = taskItemService.addTaskItem(taskItem);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location", "" + td.getTaskId());
        responseHeaders.set("Access-Control-Expose-Headers", "location");

        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    // UPDATE /todolist/{id}
    public ResponseEntity updateTaskItem(@RequestBody TaskItem taskItem, @PathVariable UUID id) {
        try {
            TaskItem taskItem1 = taskItemService.updateTaskItem(id, taskItem);
            System.out.println(taskItem1.toString());
            return new ResponseEntity<>(taskItem1, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // DELETE todolist/{id}
    public ResponseEntity<Boolean> deleteTaskItem(@PathVariable("id") UUID id) {
        Boolean flag = false;
        try {
            flag = taskItemService.deleteTaskItem(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }
}