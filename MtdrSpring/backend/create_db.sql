-- Create USERS table first as it is referenced by other tables
CREATE TABLE ADMIN.USERS 
    ( 
     USERID VARCHAR2 (50) DEFAULT SYS_GUID() , 
     NAME   VARCHAR2 (255) , 
     EMAIL  VARCHAR2 (255) ,
     TELEGRAM_USERNAME VARCHAR2 (255) ,
    ) 
    TABLESPACE DATA 
    LOGGING 
;

ALTER TABLE ADMIN.USERS 
    ADD PRIMARY KEY ( USERID ) 
    USING INDEX LOGGING ;

-- Create TEAM table as it is referenced by PROJECT_MEMBERS
CREATE TABLE ADMIN.TEAM 
    ( 
     TEAMID   RAW (16) DEFAULT SYS_GUID() , 
     TEAMNAME VARCHAR2 (255) 
    ) 
    TABLESPACE DATA 
    LOGGING 
;

ALTER TABLE ADMIN.TEAM 
    ADD PRIMARY KEY ( TEAMID ) 
    USING INDEX LOGGING ;

-- Create PROJECTS table as it is referenced by multiple tables
CREATE TABLE ADMIN.PROJECTS 
    ( 
     PROJECTID   RAW (16) DEFAULT SYS_GUID() , 
     PROJECTNAME VARCHAR2 (255) 
    ) 
    TABLESPACE DATA 
    LOGGING 
;

ALTER TABLE ADMIN.PROJECTS 
    ADD PRIMARY KEY ( PROJECTID ) 
    USING INDEX LOGGING ;

-- Create PROJECT_MEMBERS table with foreign keys to USERS, TEAM, and PROJECTS
CREATE TABLE ADMIN.PROJECT_MEMBERS 
    ( 
     PROJECTID RAW (16) , 
     TEAMID    RAW (16) , 
     USERID    RAW (16) , 
     ROLE      VARCHAR2 (255) 
    ) 
    TABLESPACE DATA 
    LOGGING 
;

ALTER TABLE ADMIN.PROJECT_MEMBERS 
    ADD PRIMARY KEY (USERID ) 
    USING INDEX LOGGING ;

ALTER TABLE ADMIN.PROJECT_MEMBERS 
    ADD FOREIGN KEY 
    ( 
     PROJECTID
    ) 
    REFERENCES ADMIN.PROJECTS ( PROJECTID ) 
    NOT DEFERRABLE 
;

ALTER TABLE ADMIN.PROJECT_MEMBERS 
    ADD FOREIGN KEY 
    ( 
     TEAMID
    ) 
    REFERENCES ADMIN.TEAM ( TEAMID ) 
    NOT DEFERRABLE 
;

ALTER TABLE ADMIN.PROJECT_MEMBERS 
    ADD FOREIGN KEY 
    ( 
     USERID
    ) 
    REFERENCES ADMIN.USERS ( USERID ) 
    NOT DEFERRABLE 
;

-- Create SPRINTS table with foreign key to PROJECTS
CREATE TABLE ADMIN.SPRINTS 
    ( 
     PROJECTID   RAW (16) , 
     SPRINTID    RAW (16) DEFAULT SYS_GUID() , 
     NAME        VARCHAR2 (255) , 
     DESCRIPTION VARCHAR2 (255) , 
     STARTDATE   DATE , 
     ENDDATE     DATE 
    ) 
    TABLESPACE DATA 
    LOGGING 
;

ALTER TABLE ADMIN.SPRINTS 
    ADD PRIMARY KEY ( SPRINTID ) 
    USING INDEX LOGGING ;

ALTER TABLE ADMIN.SPRINTS 
    ADD FOREIGN KEY 
    ( 
     PROJECTID
    ) 
    REFERENCES ADMIN.PROJECTS ( PROJECTID ) 
    NOT DEFERRABLE 
;

-- Create TASKS table with foreign keys to PROJECTS, SPRINTS, and USERS
CREATE TABLE ADMIN.TASKS 
    ( 
     PROJECTID   RAW (16) , 
     SPRINTID    RAW (16) , 
     TASKID      RAW (16) DEFAULT SYS_GUID() , 
     TITLE       VARCHAR2 (255) , 
     DESCRIPTION VARCHAR2 (255) , 
     ASSIGNEE    VARCHAR2 (50) , 
     STATUS      VARCHAR2 (255) , 
     STARTDATE   DATE , 
     ENDDATE     DATE , 
     COMMENTS    VARCHAR2 (255) , 
     STORYPOINTS NUMBER (*,0) 
    ) 
    TABLESPACE DATA 
    LOGGING 
;

ALTER TABLE ADMIN.TASKS 
    ADD PRIMARY KEY ( TASKID ) 
    USING INDEX LOGGING ;

ALTER TABLE ADMIN.TASKS 
    ADD FOREIGN KEY 
    ( 
     PROJECTID
    ) 
    REFERENCES ADMIN.PROJECTS ( PROJECTID ) 
    NOT DEFERRABLE 
;

ALTER TABLE ADMIN.TASKS 
    ADD FOREIGN KEY 
    ( 
     SPRINTID
    ) 
    REFERENCES ADMIN.SPRINTS ( SPRINTID ) 
    NOT DEFERRABLE 
;

ALTER TABLE ADMIN.TASKS 
    ADD FOREIGN KEY 
    ( 
     ASSIGNEE
    ) 
    REFERENCES ADMIN.USERS ( USERID ) 
    NOT DEFERRABLE ;