package com.springboot.TaskO.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.springboot.TaskO.model.SprintItem;
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
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

public class ToDoItemBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    
    private final ApiClientService apiClientService;
    private final String botName;
    private Map<Long, Boolean> awaitingRegistration = new HashMap<>();
    private Map<Long, Map<Integer, UUID>> userTaskIndexMap = new HashMap<>();
    private Map<Long, Map<Integer, UUID>> userSprintIndexMap = new HashMap<>();

    private static String hexToUuid(String hex) {
        return hex.replaceFirst(
            "(\\p{XDigit}{8})(\\p{XDigit}{4})(\\p{XDigit}{4})(\\p{XDigit}{4})(\\p{XDigit}+)",
            "$1-$2-$3-$4-$5"
            ).toLowerCase();
    }

    private static String uuidToHex(UUID uuid) {
        return uuid.toString().replace("-", "").toUpperCase();
    }

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
 
            if (messageTextFromTelegram.startsWith(BotCommands.REGISTER.getCommand() + " ")) {
                SendMessage messageToTelegram = new SendMessage();
                String[] parts = messageTextFromTelegram.split(" ");
                if (parts.length > 1) {
                    String email = parts[1].trim();
                    logger.info("Registering user with email: " + email + " and Telegram username: " + telegramUsername);
                    try {
                        apiClientService.registerUserByEmail(email, telegramUsername);
                        messageToTelegram.setChatId(chatId);
                        messageToTelegram.setText("¡Registro exitoso! Ahora puedes usar TaskO con este chat.");
                    } catch (Exception e) {
                        messageToTelegram.setChatId(chatId);
                        messageToTelegram.setText("No se pudo registrar: " + e.getMessage() + ". Verifica tu correo de TaskO.");
                        logger.error("Registration error: " + e.getMessage(), e);
                    }
                } else {
                    messageToTelegram.setChatId(chatId);
                    messageToTelegram.setText("Por favor, escribe tu correo así: /register tu@email.com");
                }
                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error("Error while sending message: " + e.getMessage(), e);
                }
            }
            else if (messageTextFromTelegram.startsWith(BotCommands.REGISTER.getCommand())) {
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText("Por favor, escribe tu correo de TaskO para registrarte. Ejemplo: /register tu@email.com");
                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error("Error while sending message: " + e.getMessage(), e);
                }

            }
            else if (messageTextFromTelegram.equals(BotCommands.START_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {

                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                StringBuilder sb = new StringBuilder();
                sb.append("¡Bienvenido a TaskO Bot!\n\n");
                sb.append("Comandos disponibles:\n");
                sb.append("/register <correo> - Registrar tu cuenta\n");
                sb.append("/addtask Título;Descripción;Horas - Agregar tarea\n");
                sb.append("/mytasks - Ver tus tareas pendientes\n");
                sb.append("/sprints - Ver sprints activos\n");
                sb.append("/sprinttasks <número> - Ver tareas de un sprint\n");
                sb.append("/starttask <número tarea>;<número sprint> - Asignar tarea a sprint\n");
                sb.append("/completetask <número tarea>;horas - Completar tarea\n");
                sb.append("/deletetask <número tarea> - Eliminar tarea\n");

                messageToTelegram.setText(sb.toString());

                // Opcional: solo muestra botones útiles
                ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
                List<KeyboardRow> keyboard = new ArrayList<>();

                KeyboardRow row = new KeyboardRow();
                row.add("/mytasks");
                row.add("/addtask");
                keyboard.add(row);

                row = new KeyboardRow();
                row.add("/sprints");
                row.add("/register");
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
                // Ejemplo: /starttask <número de tarea>;<sprintId>
                String[] parts = messageTextFromTelegram.replace("/starttask", "").trim().split(";");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 2) {
                    messageToTelegram.setText("Formato: /starttask <número de tarea>;<sprintId>\nPrimero usa /mytasks para ver tus tareas pendientes.");
                } else {
                    try {
                        int taskNumber = Integer.parseInt(parts[0].trim());
                        int sprintNumber = Integer.parseInt(parts[1].trim());
                        Map<Integer, UUID> indexMap = userTaskIndexMap.get(chatId);
                        Map<Integer, UUID> sprintIndexMap = userSprintIndexMap.get(chatId);
                        if (indexMap == null || !indexMap.containsKey(taskNumber)) {
                            messageToTelegram.setText("Número de tarea inválido. Usa /mytasks para ver la lista.");
                        } else if (sprintIndexMap == null || !sprintIndexMap.containsKey(sprintNumber)) {
                            messageToTelegram.setText("Número de sprint inválido. Usa /sprints para ver la lista.");
                        } else {
                            UUID taskId = indexMap.get(taskNumber);
                            UUID sprintId = sprintIndexMap.get(sprintNumber);
                            TaskItem task = apiClientService.getTaskById(taskId);
                            task.setSprintId(sprintId);
                            task.setStatus(TaskItem.Status.IN_PROGRESS);
                            apiClientService.updateTask(task, taskId);
                            messageToTelegram.setText("Tarea asignada al sprint e iniciada.");
                        }
                    } catch (Exception e) {
                        messageToTelegram.setText("Error al procesar el comando. Asegúrate de usar el formato correcto.");
                    }
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }
            } else if (messageTextFromTelegram.startsWith("/completetask")) {
                // Ejemplo: /completetask <número de tarea>;horasReales
                String[] parts = messageTextFromTelegram.replace("/completetask", "").trim().split(";");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 2) {
                    messageToTelegram.setText("Formato: /completetask <número de tarea>;horasReales");
                } else {
                    try {
                        int taskNumber = Integer.parseInt(parts[0].trim());
                        double realHours = Double.parseDouble(parts[1].trim());
                        Map<Integer, UUID> indexMap = userTaskIndexMap.get(chatId);
                        if (indexMap == null || !indexMap.containsKey(taskNumber)) {
                            messageToTelegram.setText("Número de tarea inválido. Usa /sprinttasks para ver la lista.");
                        } else {
                            UUID taskId = indexMap.get(taskNumber);
                            TaskItem task = apiClientService.getTaskById(taskId);
                            task.setStatus(TaskItem.Status.COMPLETED);
                            task.setEndDate(OffsetDateTime.now());
                            task.setComments("Tiempo real: " + realHours + " horas");
                            apiClientService.updateTask(task, taskId);
                            messageToTelegram.setText("Tarea marcada como completada. Tiempo real registrado.");
                        }
                    } catch (Exception e) {
                        messageToTelegram.setText("Error al procesar el comando. Asegúrate de usar el formato correcto.");
                    }
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }

            } else if (messageTextFromTelegram.startsWith("/sprinttasks")) {
                // Ejemplo: /sprinttasks sprintId
                String[] parts = messageTextFromTelegram.replace("/sprinttasks", "").trim().split(" ");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                if (parts.length < 1) {
                    messageToTelegram.setText("Formato: /sprinttasks <número de sprint>\nPrimero usa /sprints para ver la lista.");
                } else {
                    try {
                        int sprintNumber = Integer.parseInt(parts[0].trim());
                        Map<Integer, UUID> sprintIndexMap = userSprintIndexMap.get(chatId);
                        if (sprintIndexMap == null || !sprintIndexMap.containsKey(sprintNumber)) {
                            messageToTelegram.setText("Número de sprint inválido. Usa /sprints para ver la lista.");
                        } else {
                            UUID sprintId = sprintIndexMap.get(sprintNumber);
                            List<TaskItem> allTasks = apiClientService.getAllTasks();
                            List<TaskItem> sprintTasks = allTasks.stream()
                                .filter(t -> sprintId.equals(t.getSprintId()))
                                .collect(Collectors.toList());
                            StringBuilder sb = new StringBuilder("Tareas del sprint:\n");
                            int idx = 1;
                            Map<Integer, UUID> taskIndexMap = new HashMap<>();
                            for (TaskItem t : sprintTasks) {
                                sb.append(idx).append(". ").append(t.getTitle()).append(" (").append(t.getStatus()).append(")\n");
                                taskIndexMap.put(idx, t.getTaskId());
                                idx++;
                            }
                            if (sprintTasks.isEmpty()) {
                                sb.append("No hay tareas en este sprint.");
                            }
                            messageToTelegram.setText(sb.toString());
                            userTaskIndexMap.put(chatId, taskIndexMap);
                        }
                    } catch (Exception e) {
                        messageToTelegram.setText("Error al procesar el comando. Usa /sprints para ver la lista.");
                    }
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }

            } else if (messageTextFromTelegram.startsWith("/mytasks")) {
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
            
                UserItem user = apiClientService.getUserByTelegramUsername(telegramUsername);
                if (user == null) {
                    messageToTelegram.setText("No estás registrado. Usa /register primero.");
                } else {
                    List<TaskItem> allTasks = apiClientService.getAllTasks();
                    List<TaskItem> myTasks = allTasks.stream()
                        .filter(t -> user.getUserId().equals(t.getAssignee()) && (t.getSprintId() == null || t.getStatus() == TaskItem.Status.TODO))
                        .collect(Collectors.toList());
            
                    if (myTasks.isEmpty()) {
                        messageToTelegram.setText("No tienes tareas pendientes para asignar a un sprint.");
                    } else {
                        StringBuilder sb = new StringBuilder("Tus tareas pendientes:\n");
                        int idx = 1;
                        Map<Integer, UUID> taskIndexMap = new HashMap<>();
                        for (TaskItem t : myTasks) {
                            sb.append(idx).append(". ").append(t.getTitle()).append(" (").append(t.getStatus()).append(")\n");
                            taskIndexMap.put(idx, t.getTaskId());
                            idx++;
                        }
                        sb.append("\nUsa /starttask <número>;<sprintId> para asignar una tarea a un sprint.");
                        messageToTelegram.setText(sb.toString());
                        userTaskIndexMap.put(chatId, taskIndexMap);
                    }
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }
            } else if (messageTextFromTelegram.startsWith("/sprints")) {
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);

                List<SprintItem> allSprints = apiClientService.getAllSprints();
                List<SprintItem> activeSprints = allSprints.stream()
                    .filter(SprintItem::isActive)
                    .collect(Collectors.toList());

                if (activeSprints.isEmpty()) {
                    messageToTelegram.setText("No hay sprints activos.");
                } else {
                    StringBuilder sb = new StringBuilder("Sprints activos:\n");
                    int idx = 1;
                    Map<Integer, UUID> sprintIndexMap = new HashMap<>();
                    for (SprintItem sprint : activeSprints) {
                        sb.append(idx).append(". ").append(sprint.getName()).append("\n");
                        sprintIndexMap.put(idx, sprint.getSprintId());
                        idx++;
                    }
                    sb.append("\nUsa /sprinttasks <número> para ver las tareas de un sprint.");
                    messageToTelegram.setText(sb.toString());
                    // Guarda el mapa para el usuario
                    userSprintIndexMap.put(chatId, sprintIndexMap);
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }
            } else if (messageTextFromTelegram.startsWith("/deletetask")) {
                // Ejemplo: /deletetask <número de tarea>
                String[] parts = messageTextFromTelegram.replace("/deletetask", "").trim().split(";");
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                if (parts.length < 1) {
                    messageToTelegram.setText("Formato: /deletetask <número de tarea>\nPrimero usa /mytasks para ver la lista.");
                } else {
                    try {
                        int taskNumber = Integer.parseInt(parts[0].trim());
                        Map<Integer, UUID> indexMap = userTaskIndexMap.get(chatId);
                        if (indexMap == null || !indexMap.containsKey(taskNumber)) {
                            messageToTelegram.setText("Número de tarea inválido. Usa /mytasks para ver la lista.");
                        } else {
                            UUID taskId = indexMap.get(taskNumber);
                            apiClientService.deleteTask(taskId);
                            messageToTelegram.setText("Tarea eliminada correctamente.");
                        }
                    } catch (Exception e) {
                        messageToTelegram.setText("Error al procesar el comando. Asegúrate de usar el formato correcto.");
                    }
                }
                try { execute(messageToTelegram); } catch (TelegramApiException e) { logger.error(e.getMessage(), e); }
            }
            else if (messageTextFromTelegram.equals(BotCommands.HIDE_COMMAND.getCommand())
                    || messageTextFromTelegram.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel())) {

                BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), this);

            } else {
                SendMessage messageToTelegram = new SendMessage();
                messageToTelegram.setChatId(chatId);
                messageToTelegram.setText("Comando no reconocido. Usa /start para ver la lista de comandos disponibles.");
                try {
                    execute(messageToTelegram);
                } catch (TelegramApiException e) {
                    logger.error(e.getLocalizedMessage(), e);
                }
            }
        }
    }
}