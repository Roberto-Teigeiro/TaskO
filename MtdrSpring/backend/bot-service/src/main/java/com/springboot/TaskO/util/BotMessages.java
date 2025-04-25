package com.springboot.TaskO.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"¡Bienvenido a TaskO Bot!  \r\n" + //
				"Comandos disponibles:\r\n" + //
				"/register <correo> - Registrar tu cuenta\r\n" + //
				"/addtask Título;Descripción;Horas - Agregar tarea\r\n" + //
				"/mytasks - Ver tus tareas pendientes\r\n" + //
				"/sprints - Ver sprints activos\r\n" + //
				"/sprinttasks <número> - Ver tareas de un sprint\r\n" + //
				"/starttask <número tarea>;<número sprint> - Asignar tarea a sprint\r\n" + //
				"/completetask <número tarea>;horas - Completar tarea"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the rigth-hand side."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	BYE("Bye! Select /start to resume!");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
