--------------------------------------------------------
--  File created - 2025-05-17 
--  Versión base para control de versiones manual
--------------------------------------------------------

--------------------------------------------------------
--  DDL for Table PROJECT_MEMBERS
--------------------------------------------------------

CREATE TABLE "ADMIN"."PROJECT_MEMBERS" 
(
  "PROJECTID" RAW(16), 
  "TEAMID" RAW(16), 
  "USERID" VARCHAR2(255 BYTE), 
  "ROLE" VARCHAR2(255 BYTE)
);

--------------------------------------------------------
--  DDL for Table PROJECTS
--------------------------------------------------------

CREATE TABLE "ADMIN"."PROJECTS" 
(
  "PROJECTID" RAW(16) DEFAULT SYS_GUID(), 
  "PROJECTNAME" VARCHAR2(255 BYTE)
);

--------------------------------------------------------
--  DDL for Table SPRINTS
--------------------------------------------------------

CREATE TABLE "ADMIN"."SPRINTS" 
(
  "PROJECTID" RAW(16), 
  "SPRINTID" RAW(16) DEFAULT SYS_GUID(), 
  "NAME" VARCHAR2(255 BYTE), 
  "DESCRIPTION" VARCHAR2(255 BYTE), 
  "STARTDATE" DATE, 
  "ENDDATE" DATE, 
  "ACTIVE" NUMBER(1,0)
);

--------------------------------------------------------
--  DDL for Table TASKS
--------------------------------------------------------

CREATE TABLE "ADMIN"."TASKS" 
(
  "PROJECTID" RAW(16), 
  "SPRINTID" RAW(16), 
  "TASKID" RAW(16) DEFAULT SYS_GUID(), 
  "TITLE" VARCHAR2(255 BYTE), 
  "DESCRIPTION" VARCHAR2(255 BYTE), 
  "ASSIGNEE" VARCHAR2(50 BYTE), 
  "STATUS" VARCHAR2(255 BYTE), 
  "STARTDATE" DATE, 
  "ENDDATE" DATE, 
  "COMMENTS" VARCHAR2(255 BYTE), 
  "STORYPOINTS" NUMBER(*,0), 
  "ESTIMATEDHOURS" FLOAT(126), 
  "REALHOURS" FLOAT(126)
);

--------------------------------------------------------
--  DDL for Table TEAM
--------------------------------------------------------

CREATE TABLE "ADMIN"."TEAM" 
(
  "TEAMID" RAW(16) DEFAULT SYS_GUID(), 
  "TEAMNAME" VARCHAR2(255 BYTE), 
  "PROJECTID" RAW(16)
);

--------------------------------------------------------
--  DDL for Table USERS
--------------------------------------------------------

CREATE TABLE "ADMIN"."USERS" 
(
  "USERID" VARCHAR2(50 BYTE) DEFAULT SYS_GUID(), 
  "NAME" VARCHAR2(255 BYTE), 
  "EMAIL" VARCHAR2(255 BYTE), 
  "TELEGRAMUSERNAME" VARCHAR2(255 BYTE)
);

--------------------------------------------------------
--  DDL for Index PROJECT_MEMBERS_PK
--------------------------------------------------------

CREATE UNIQUE INDEX "ADMIN"."PROJECT_MEMBERS_PK" ON "ADMIN"."PROJECT_MEMBERS" ("USERID");

--------------------------------------------------------
--  DDL for Index PROJECTS_PK
--------------------------------------------------------

CREATE UNIQUE INDEX "ADMIN"."PROJECTS_PK" ON "ADMIN"."PROJECTS" ("PROJECTID");

--------------------------------------------------------
--  DDL for Index SPRINTS_PK
--------------------------------------------------------

CREATE UNIQUE INDEX "ADMIN"."SPRINTS_PK" ON "ADMIN"."SPRINTS" ("SPRINTID");

--------------------------------------------------------
--  DDL for Index TASKS_PK
--------------------------------------------------------

CREATE UNIQUE INDEX "ADMIN"."TASKS_PK" ON "ADMIN"."TASKS" ("TASKID");

--------------------------------------------------------
--  DDL for Index TEAM_PK
--------------------------------------------------------

CREATE UNIQUE INDEX "ADMIN"."TEAM_PK" ON "ADMIN"."TEAM" ("TEAMID");

--------------------------------------------------------
--  DDL for Index USERS_PK
--------------------------------------------------------

CREATE UNIQUE INDEX "ADMIN"."USERS_PK" ON "ADMIN"."USERS" ("USERID");

--------------------------------------------------------
--  Constraints for Table PROJECT_MEMBERS
--------------------------------------------------------

ALTER TABLE "ADMIN"."PROJECT_MEMBERS" ADD CONSTRAINT "PROJECT_MEMBERS_PK" PRIMARY KEY ("USERID") ENABLE;

--------------------------------------------------------
--  Constraints for Table PROJECTS
--------------------------------------------------------

ALTER TABLE "ADMIN"."PROJECTS" ADD CONSTRAINT "PROJECTS_PK" PRIMARY KEY ("PROJECTID") ENABLE;

--------------------------------------------------------
--  Constraints for Table SPRINTS
--------------------------------------------------------

ALTER TABLE "ADMIN"."SPRINTS" ADD CONSTRAINT "SPRINTS_PK" PRIMARY KEY ("SPRINTID") ENABLE;

--------------------------------------------------------
--  Constraints for Table TASKS
--------------------------------------------------------

ALTER TABLE "ADMIN"."TASKS" ADD CONSTRAINT "TASKS_PK" PRIMARY KEY ("TASKID") ENABLE;

--------------------------------------------------------
--  Constraints for Table TEAM
--------------------------------------------------------

ALTER TABLE "ADMIN"."TEAM" ADD CONSTRAINT "TEAM_PK" PRIMARY KEY ("TEAMID") ENABLE;

--------------------------------------------------------
--  Constraints for Table USERS
--------------------------------------------------------

ALTER TABLE "ADMIN"."USERS" ADD CONSTRAINT "USERS_PK" PRIMARY KEY ("USERID") ENABLE;

--------------------------------------------------------
--  Ref Constraints for Table PROJECT_MEMBERS
--------------------------------------------------------

ALTER TABLE "ADMIN"."PROJECT_MEMBERS" ADD CONSTRAINT "FK_PM_PROJECTID" FOREIGN KEY ("PROJECTID")
    REFERENCES "ADMIN"."PROJECTS" ("PROJECTID") DISABLE;
ALTER TABLE "ADMIN"."PROJECT_MEMBERS" ADD CONSTRAINT "FK_PM_TEAMID" FOREIGN KEY ("TEAMID")
    REFERENCES "ADMIN"."TEAM" ("TEAMID") DISABLE;

--------------------------------------------------------
--  Ref Constraints for Table SPRINTS
--------------------------------------------------------

ALTER TABLE "ADMIN"."SPRINTS" ADD CONSTRAINT "FK_SPRINTS_PROJECTID" FOREIGN KEY ("PROJECTID")
    REFERENCES "ADMIN"."PROJECTS" ("PROJECTID") DISABLE;

--------------------------------------------------------
--  Ref Constraints for Table TASKS
--------------------------------------------------------

ALTER TABLE "ADMIN"."TASKS" ADD CONSTRAINT "FK_TASKS_PROJECTID" FOREIGN KEY ("PROJECTID")
    REFERENCES "ADMIN"."PROJECTS" ("PROJECTID") DISABLE;
ALTER TABLE "ADMIN"."TASKS" ADD CONSTRAINT "FK_TASKS_SPRINTID" FOREIGN KEY ("SPRINTID")
    REFERENCES "ADMIN"."SPRINTS" ("SPRINTID") DISABLE;
ALTER TABLE "ADMIN"."TASKS" ADD CONSTRAINT "FK_TASKS_ASSIGNEE" FOREIGN KEY ("ASSIGNEE")
    REFERENCES "ADMIN"."USERS" ("USERID") ENABLE;