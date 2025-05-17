# Tutorial: Creación y Limpieza de Respaldo Inicial SQL

Este documento detalla el proceso utilizado para crear el respaldo inicial de la base de datos y su posterior limpieza para utilizarlo en un sistema de control de versiones manual.

## 1. Generación del Respaldo Inicial

Para obtener un respaldo completo de la estructura de la base de datos, utilicé Oracle SQL Developer siguiendo estos pasos:

1. **Conexión a la base de datos**:
   - Abrí Oracle SQL Developer
   - Me conecté a la base de datos utilizando las credenciales del proyecto TaskO

2. **Exportación de la estructura**:
   - Hice clic derecho en la conexión
   - Seleccioné la opción **Exportar...**
   - En el diálogo de exportación:
     - Marqué la opción **DDL** para obtener las definiciones de objetos
     - Seleccioné todas las tablas del esquema ADMIN
     - Configuré la ruta de salida para el archivo .sql generado
     - Completé los pasos del asistente para generar el archivo

## 2. Limpieza del Script Generado

El archivo SQL generado por Oracle SQL Developer contenía elementos innecesarios para el control de versiones que debían ser eliminados. A continuación se detalla el proceso de limpieza:

### 2.1. Análisis del Contenido Original

El script original contenía:
- Definiciones CREATE TABLE con cláusulas específicas del entorno como TABLESPACE y COLLATE
- Configuraciones de almacenamiento como PCTFREE, PCTUSED, INITRANS, MAXTRANS
- Declaraciones SET DEFINE OFF y REM INSERTING (aunque no contenía sentencias INSERT reales)
- Índices y restricciones con referencias a TABLESPACE

### 2.2. Proceso de Limpieza Manual

1. **Eliminación de cláusulas COLLATE**:
   - Identifiqué y eliminé todas las ocurrencias de `COLLATE "USING_NLS_COMP"` en las definiciones de columnas
   - Quité la cláusula `DEFAULT COLLATION "USING_NLS_COMP"` de todas las definiciones de tablas

2. **Eliminación de especificaciones TABLESPACE**:
   - Eliminé todas las referencias a `TABLESPACE "DATA"` en la definición de tablas, índices y restricciones
   - Quité las configuraciones de almacenamiento asociadas: `SEGMENT CREATION DEFERRED`, `PCTFREE 10 PCTUSED 40 INITRANS 10 MAXTRANS 255`, `NOCOMPRESS LOGGING`

3. **Simplificación de la sintaxis**:
   - Reorganicé los paréntesis y el formato para mejorar la legibilidad
   - Mantuve los comentarios separadores para hacer el script más comprensible

## 3. Verificación de la Estructura Limpia

Para comprobar que la estructura limpia era funcional:

1. **Evaluación del Script**:
   - Observé que las tablas ya existían en la base de datos
   - Confirmé que el script limpio contenía toda la estructura necesaria para recrear la base de datos desde cero (en caso necesario)

2. **Decisión**:
   - Determiné que no era necesario ejecutar el script limpio, ya que funcionaría como punto de referencia para el control de versiones
   - Procedí a guardar el script limpio como `V0__base.sql` para usarlo como base del sistema de control de versiones

## 4. Resultado Final

El script final `V0__base.sql` contiene:
- Definiciones CREATE TABLE limpias para todas las tablas del esquema ADMIN
- Definiciones CREATE INDEX para todos los índices
- Definiciones ALTER TABLE para restricciones de clave primaria y foránea
- Formato consistente y comentarios organizados

Este archivo servirá como punto de partida ("línea base") para el control de versiones manual de la base de datos del proyecto TaskO.