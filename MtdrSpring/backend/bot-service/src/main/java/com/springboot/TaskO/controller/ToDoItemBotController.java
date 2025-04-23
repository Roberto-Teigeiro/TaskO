package com.springboot.TaskO.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.springboot.TaskO.model.TaskItem;
import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.service.ApiClientService;
import com.springboot.TaskO.util.BotCommands;
import com.springboot.TaskO.util.BotHelper;
import com.springboot.TaskO.util.BotLabels;
import com.springboot.TaskO.util.BotMessages;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

public class ToDoItemBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    
    private final ApiClientService apiClientService;
    private final String botName;
    private Map<Long, Boolean> awaitingRegistration = new HashMap<>();

    public ToDoItemBotController(String token, String botName, ApiClientService apiClientService) {
        super(token);
        this.botName = botName;
        this.apiClientService = apiClientService;
    }

    @Override
    public String getBotUsername() {
        return botName;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {

            String messageTextFromTelegram = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();
            String telegramUsername = update.getMessage().getFrom().getUserName();

            // Handle registration command or process
            if (messageTextFromTelegram.equals(BotCommands.REGISTER.getCommand())) {
                // Start registration process
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText("Please enter your TaskO username to register:");
                
                // Mark this user as awaiting registration
                awaitingRegistration.put(chatId, true);
                
                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error("Error while sending message: " + e.getMessage(), e);
                }
            } 
            // Handle registration with username parameter
            else if (messageTextFromTelegram.startsWith(BotCommands.REGISTER.getCommand() + " ")) {
                SendMessage messageToTelegram = new SendMessage();
                String[] parts = messageTextFromTelegram.split(" ");
                if (parts.length > 1) {
                    String username = parts[1];
                    logger.info("Registering user: " + username + " with Telegram username: " + telegramUsername);
                    try {
                        apiClientService.registerUser(username, telegramUsername);
                        messageToTelegram.setChatId(chatId);
                        messageToTelegram.setText("You have been successfully registered as " + username + "! You can now use TaskO through this chat.");
                    } catch (Exception e) {
                        messageToTelegram.setChatId(chatId);
                        messageToTelegram.setText("Registration failed: " + e.getMessage() + ". Please try again.");
                        logger.error("Registration error: " + e.getMessage(), e);
                    }
                } else {
                    messageToTelegram.setChatId(chatId);
                    messageToTelegram.setText("Please provide your username like this: /register yourusername");
                }
                
                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error("Error while sending message: " + e.getMessage(), e);
                }
            }
            // Process username input if awaiting registration
            else if (awaitingRegistration.getOrDefault(chatId, false)) {
                String username = messageTextFromTelegram;
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                
                try {
                    apiClientService.registerUser(username, telegramUsername);
                    messageToTelegram.setText("You have been successfully registered as " + username + "! You can now use TaskO through this chat.");
                    
                    // Registration complete, show main screen
                    ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                    List<KeyboardRow> keyboard = new ArrayList<>();

                    KeyboardRow row = new KeyboardRow();
                    row.add(BotLabels.LIST_ALL_ITEMS.getLabel());
                    row.add(BotLabels.ADD_NEW_ITEM.getLabel());
                    keyboard.add(row);

                    keyboardMarkup.setKeyboard(keyboard);
                    messageToTelegram.setReplyMarkup(keyboardMarkup);
                    
                } catch (Exception e) {
                    messageToTelegram.setText("Registration failed: " + e.getMessage() + ". Please try again with /register command.");
                    logger.error("Registration error: " + e.getMessage(), e);
                }
                
                // Clear registration state
                awaitingRegistration.remove(chatId);
                
                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error("Error while sending message: " + e.getMessage(), e);
                }
            }
            // Handle other commands as before
            else if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {

                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText(BotMessages.HELLO_MYTODO_BOT.getMessage());

                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                KeyboardRow row = new KeyboardRow();
                row.add(BotLabels.LIST_ALL_ITEMS.getLabel());
                row.add(BotLabels.ADD_NEW_ITEM.getLabel());
                keyboard.add(row);

                row = new KeyboardRow();
                row.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                row.add(BotLabels.HIDE_MAIN_SCREEN.getLabel());
                keyboard.add(row);

                keyboardMarkup.setKeyboard(keyboard);
                messageToTelegram.setReplyMarkup(keyboardMarkup);

                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.indexOf(BotLabels.DONE.getLabel()) != -1) {
                String done = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                UUID id = UUID.fromString(done);

                try {
                    TaskItem item = apiClientService.getTaskById(id);
                    item.setStatus(TaskItem.Status.COMPLETED);
                    apiClientService.updateTask(item, id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage(), this);
                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            } else if (messageTextFromTelegram.indexOf(BotLabels.UNDO.getLabel()) != -1) {
                String undo = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                UUID id = UUID.fromString(undo);

                try {
                    TaskItem item = apiClientService.getTaskById(id);
                    item.setStatus(TaskItem.Status.TODO);
                    apiClientService.updateTask(item, id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), this);
                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            } else if (messageTextFromTelegram.indexOf(BotLabels.DELETE.getLabel()) != -1) {

                String delete = messageTextFromTelegram.substring(0,
                        messageTextFromTelegram.indexOf(BotLabels.DASH.getLabel()));
                UUID id = UUID.fromString(delete);

                try {
                    apiClientService.deleteTask(id);
                    BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), this);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else if (messageTextFromTelegram.startsWith("/addtask")){
                // Ejemplo: /addtask Titulo;Descripcion;3.5
                String[] parts = messageTextFromTelegram.replace("/addtask", "").trim().split(";");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 3) {
                    messageToTelegram.setText("Formato: /addtask Titulo;Descripcion;HorasEstimadas (ejemplo: /addtask Login;Crear login;2)");
                } else {
                    String title = parts[0].trim();
                    String description = parts[1].trim();
                    double estimatedHours = Double.parseDouble(parts[2].trim());
                    if (estimatedHours > 4.0) {
                        messageToTelegram.setText("La tarea excede 4 horas. Por favor subdivídela en tareas menores.");
                    } else {
                        UserItem user = apiClientService.getUserByTelegramUsername(telegramUsername);
                        if (user == null) {
                            messageToTelegram.setText("No estás registrado. Usa /register primero.");
                        } else {
                            TaskItem newTask = new TaskItem();
                            newTask.setTitle(title);
                            newTask.setDescription(description);
                            newTask.setEstimatedHours(estimatedHours);
                            newTask.setStatus(TaskItem.Status.TODO);
                            newTask.setStartDate(OffsetDateTime.now());
                            newTask.setAssignee(user.getUserId());
                            apiClientService.addTask(newTask);
                            messageToTelegram.setText("Tarea agregada correctamente.");
                        }
                        
                    
                    }
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }

            } else if (messageTextFromTelegram.startsWith("/starttask")) {
                // Ejemplo: /starttask taskId;sprintId
                String[] parts = messageTextFromTelegram.replace("/starttask", "").trim().split(";");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 2) {
                    messageToTelegram.setText("Formato: /starttask taskId;sprintId");
                } else {
                    UUID taskId = UUID.fromString(parts[0].trim());
                    UUID sprintId = UUID.fromString(parts[1].trim());
                    TaskItem task = apiClientService.getTaskById(taskId);
                    task.setSprintId(sprintId);
                    task.setStatus(TaskItem.Status.IN_PROGRESS);
                    apiClientService.updateTask(task, taskId);
                    messageToTelegram.setText("Tarea asignada al sprint e iniciada.");
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }

            } else if (messageTextFromTelegram.startsWith("/completetask")) {
                // Ejemplo: /completetask taskId;horasReales
                String[] parts = messageTextFromTelegram.replace("/completetask", "").trim().split(";");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 2) {
                    messageToTelegram.setText("Formato: /completetask taskId;horasReales");
                } else {
                    UUID taskId = UUID.fromString(parts[0].trim());
                    double realHours = Double.parseDouble(parts[1].trim());
                    TaskItem task = apiClientService.getTaskById(taskId);
                    task.setStatus(TaskItem.Status.COMPLETED);
                    task.setEndDate(OffsetDateTime.now());
                    task.setComments("Tiempo real: " + realHours + " horas");
                    apiClientService.updateTask(task, taskId);
                    messageToTelegram.setText("Tarea marcada como completada. Tiempo real registrado.");
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }

            } else if (messageTextFromTelegram.startsWith("/sprinttasks")) {
                // Ejemplo: /sprinttasks sprintId
                String[] parts = messageTextFromTelegram.replace("/sprinttasks", "").trim().split(" ");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 1) {
                    messageToTelegram.setText("Formato: /sprinttasks sprintId");
                } else {
                    UUID sprintId = UUID.fromString(parts[0].trim());
                    List<TaskItem> allTasks = apiClientService.getAllTasks();
                    List<TaskItem> sprintTasks = allTasks.stream()
                        .filter(t -> sprintId.equals(t.getSprintId()))
                        .collect(Collectors.toList());
                    StringBuilder sb = new StringBuilder("Tareas del sprint:\n");
                    for (TaskItem t : sprintTasks) {
                        sb.append("- ").append(t.getName()).append(" (").append(t.getStatus()).append(")\n");
                    }
                    messageToTelegram.setText(sb.toString());
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }

            } else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {

                BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);

            } else if (messageTextFromTelegram.equals(BotCommands.TODO_LIST.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
                    || messageTextFromTelegram.equals(BotLabels.MY_TODO_LIST.getLabel())) {

                List<TaskItem> allItems = apiClientService.getAllTasks();
                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                KeyboardRow mainScreenRowTop = new KeyboardRow();
                mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
                keyboard.add(mainScreenRowTop);

                KeyboardRow firstRow = new KeyboardRow();
                firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
                keyboard.add(firstRow);

                KeyboardRow TaskOTitleRow = new KeyboardRow();
                TaskOTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
                keyboard.add(TaskOTitleRow);

                List<TaskItem> activeItems = allItems.stream()
                        .filter(item -> item.getStatus() != TaskItem.Status.COMPLETED)
                        .collect(Collectors.toList());

                for (TaskItem item : activeItems) {
                    KeyboardRow currentRow = new KeyboardRow();
                    currentRow.add(item.getDescription());
                    currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
                    keyboard.add(currentRow);
                }

                List<TaskItem> doneItems = allItems.stream()
                        .filter(item -> item.getStatus() == TaskItem.Status.COMPLETED)
                        .collect(Collectors.toList());

                for (TaskItem item : doneItems) {
                    KeyboardRow currentRow = new KeyboardRow();
                    currentRow.add(item.getDescription());
                    currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
                    currentRow.add(item.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
                    keyboard.add(currentRow);
                }

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
                    ReplyKeyboardRemove keyboardMarkup = new ReplyKeyboardRemove(true);
                    messageToTelegram.setReplyMarkup(keyboardMarkup);

                    execute(messageToTelegram);

                } catch (Exception e) {
                    logger.error(e.getLocalizedMessage(), e);
                }

            } else {
                try {
                    TaskItem newItem = new TaskItem();
                    newItem.setDescription(messageTextFromTelegram);
                    newItem.setStartDate(OffsetDateTime.now());
                    newItem.setStatus(TaskItem.Status.TODO);
                    apiClientService.addTask(newItem);

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
}