-- Connect as SYSDBA
CONNECT / AS SYSDBA

-- Check if we're in the right container database
ALTER SESSION SET CONTAINER = MTDRDB;

-- Create ADMIN user if doesn't exist (will catch errors if already exists)
DECLARE
  user_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO user_exists FROM dba_users WHERE username = 'ADMIN';
  IF user_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE USER ADMIN IDENTIFIED BY "Taskopassword123"';
    EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE, DBA TO ADMIN';
    EXECUTE IMMEDIATE 'GRANT UNLIMITED TABLESPACE TO ADMIN';
  END IF;
END;
/

-- Grant necessary permissions
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE PROCEDURE TO ADMIN;
ALTER USER ADMIN QUOTA UNLIMITED ON USERS;

-- Exit gracefully
EXIT;