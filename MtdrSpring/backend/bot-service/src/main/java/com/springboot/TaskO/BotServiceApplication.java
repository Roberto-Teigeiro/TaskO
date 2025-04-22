package com.springboot.TaskO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

import com.springboot.TaskO.controller.ToDoItemBotController;
import com.springboot.TaskO.service.ApiClientService;
import com.springboot.TaskO.util.BotMessages;

@SpringBootApplication
public class BotServiceApplication implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(BotServiceApplication.class);

    @Autowired
    private ApiClientService apiClientService;

    @Value("${telegram.bot.token}")
    private String telegramBotToken;

    @Value("${telegram.bot.name}")
    private String botName;

    public static void main(String[] args) {
        SpringApplication.run(BotServiceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            TelegramBotsApi telegramBotsApi = new TelegramBotsApi(DefaultBotSession.class);
            telegramBotsApi.registerBot(new ToDoItemBotController(telegramBotToken, botName, apiClientService));
            logger.info(BotMessages.BOT_REGISTERED_STARTED.getMessage());
        } catch (TelegramApiException e) {
            logger.error("Failed to register bot", e);
        }
    }
}