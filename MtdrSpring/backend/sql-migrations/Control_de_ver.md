# Implementación de Control de Versiones Manual para Base de Datos Oracle

Este documento describe el proceso seguido para implementar un sistema de control de versiones manual para la base de datos Oracle del proyecto TaskO.

## 1. Introducción al Control de Versiones para Bases de Datos

El control de versiones para bases de datos es esencial para:
- Seguir los cambios en la estructura de la base de datos a lo largo del tiempo
- Facilitar la colaboración entre desarrolladores
- Permitir el despliegue consistente en diferentes entornos
- Proporcionar un historial de modificaciones para depuración y auditoría

El enfoque adoptado es un sistema manual basado en scripts SQL numerados consecutivamente que se aplican en orden secuencial.

## 2. Estructura de Archivos Implementada

Se creó la siguiente estructura de archivos en el repositorio Git:
```
Tasko/
├── MtdrSpring/   
|   ├─── backend/
|       ├─── api-service/
|       ├─── bot-service/
|       ├─── frontend-service/
|       ├─── sql-migrations/ #esta carpeta fue agregada         
└── //demas archivos    
```


### 2.1. Convención de Nomenclatura

Para los archivos de migración se adoptó el siguiente formato:
- **V{número}\_\_{fecha}\_descripcion.sql**
  - **V{número}**: Identificador secuencial único de la versión
  - **{fecha}**: Fecha de creación en formato YYYYMMDD
  - **descripcion**: Breve descripción del cambio realizado

## 3. Proceso Paso a Paso

### 3.1. Creación del Archivo Base (V0__base.sql)

1. **Exportación de la Base de Datos**
   - Se utilizó Oracle SQL Developer para exportar la estructura completa de la base de datos
   - Se generó un archivo SQL con todas las definiciones DDL (sin datos)

2. **Limpieza del Script**
   - Se eliminaron todas las cláusulas COLLATE y TABLESPACE
   - Se eliminaron las configuraciones de almacenamiento específicas
   - Se mantuvo la estructura esencial para recrear las tablas, índices y restricciones

3. **Almacenamiento del Script Base**
   - Se guardó el script limpio como `V0__base.sql` en la carpeta `sql-migrations`
   - Este archivo representa el estado inicial de la estructura de la base de datos

### 3.2. Implementación de la Primera Migración

1. **Planificación del Cambio**
   - Se identificó la necesidad de añadir una columna `INTERESES` a la tabla `USERS`
   - Se determinó el tipo de dato adecuado: VARCHAR2(100)

2. **Prueba del Cambio**
   - Se ejecutó el comando ALTER TABLE en la base de datos local:
     ```sql
     ALTER TABLE "ADMIN"."USERS" ADD ("INTERESES" VARCHAR2(100));
     ```
   - Se verificó que la columna se agregara correctamente mediante consultas a los metadatos

3. **Creación del Archivo de Migración**
   - Se creó el archivo `V1__20250517_agrega_columna_intereses.sql` con la sentencia ALTER TABLE
   - Se añadió un comentario explicativo sobre el propósito del cambio

4. **Integración en el Control de Versiones**
   - Se agregó el archivo al repositorio Git
   - Se realizó commit con un mensaje descriptivo

## 4. Mejores Prácticas Adoptadas

### 4.1. Para Archivos Base y de Migración

- **Scripts idempotentes**: Se verificó que los scripts de migración puedan ejecutarse una sola vez sin errores
- **Scripts autocontenidos**: Cada script contiene todos los cambios necesarios para una modificación específica
- **Comentarios descriptivos**: Se añadieron comentarios para explicar el propósito de cada cambio
- **Versiones secuenciales**: Se aseguró un orden claro de aplicación mediante la numeración secuencial

### 4.2. Para el Proceso de Control de Versiones

- **No modificar migraciones existentes**: Una vez que una migración se ha aplicado, nunca se modifica
- **Pruebas previas**: Todos los cambios se prueban en un entorno local antes de crear el archivo de migración
- **Documentación clara**: Se documentó el proceso para referencia futura y para facilitar la incorporación de nuevos desarrolladores

## 5. Aplicación de Migraciones

Para aplicar las migraciones en un nuevo entorno o en una instalación limpia:

1. Ejecutar `V0__base.sql` para crear la estructura inicial
2. Ejecutar cada archivo de migración en orden secuencial (V1, V2, etc.)

Para entornos existentes que ya tienen la estructura base:
1. Verificar qué versiones ya se han aplicado
2. Aplicar solo las migraciones pendientes en orden secuencial

## 6. Conclusión

Este sistema de control de versiones manual proporciona un enfoque estructurado y documentado para gestionar los cambios en la estructura de la base de datos. Aunque es un sistema manual, establece las bases para una posible automatización futura mediante herramientas como Flyway o Liquibase.

El proceso implementado garantiza que todos los cambios en la estructura de la base de datos:
- Se documenten adecuadamente
- Se apliquen de manera consistente
- Se puedan rastrear a lo largo del tiempo
- Se integren con el sistema general de control de versiones del proyecto