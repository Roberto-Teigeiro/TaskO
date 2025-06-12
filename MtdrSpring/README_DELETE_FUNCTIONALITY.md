# Delete Functionality - Team Manager Only

This document describes the new delete functionality that has been added to the TaskO application.

## Backend Changes

### 1. Sprint Delete Endpoint
- **Endpoint**: `DELETE /sprint/{id}`
- **Location**: `SprintItemController.java`
- **Description**: Allows deletion of sprints by UUID

### 2. Task Delete Endpoint  
- **Endpoint**: `DELETE /task/{id}` 
- **Location**: `TaskController.java` (already existed)
- **Description**: Allows deletion of tasks by UUID

### 3. Manager Check Endpoint
- **Endpoint**: `GET /projects/{projectId}/manager/{userId}`
- **Location**: `ProjectMemberItemController.java`
- **Description**: Checks if a user is a manager for a specific project
- **Logic**: Currently considers the first user in a project as the manager

## Frontend Changes

### 1. Delete Sprint Dialog (`DeleteSprintDialog.tsx`)
- Confirmation dialog for deleting sprints
- Shows warning about consequences
- Only accessible to team managers

### 2. Delete Task Dialog (`DeleteTaskDialog.tsx`)
- Confirmation dialog for deleting tasks
- Shows warning about permanent deletion
- Only accessible to team managers

### 3. Manager Hook (`useManager.tsx`)
- Custom React hook to check if current user is a manager
- Automatically checks manager status for the current project
- Returns loading state and manager status

### 4. Updated Components

#### TaskItem Component (`Task-item.tsx`)
- Added `isManager` prop
- Delete button only visible to managers
- Integrates with delete task functionality

#### Sprints Component (`Sprints.tsx`)
- Uses `useManager` hook to check manager status
- Shows delete sprint button only to managers
- Passes manager status to TaskItem components
- Handles sprint deletion and UI updates

## Manager Logic

Currently, the application considers the **first user added to a project** as the team manager. This is a simple implementation that can be enhanced later with:

- Role-based permissions
- Multiple managers per project
- Admin roles
- Permission inheritance

## Security Notes

- All delete operations require manager privileges
- Frontend UI only shows delete buttons to managers
- Backend endpoints should also validate manager status (recommended enhancement)
- Delete operations are permanent and cannot be undone

## How to Test

1. **Restart your backend** after running the database migration for priority support
2. **Login as the first user** who was added to a project (they will be the manager)
3. **Navigate to Sprints page**
4. **Look for red trash icons** next to sprints (if you're a manager)
5. **Expand a sprint** and look for red trash icons next to tasks (if you're a manager)
6. **Try deleting** - you'll see confirmation dialogs with warnings

## Future Enhancements

- Add role-based access control (RBAC)
- Add audit logging for delete operations
- Add soft delete with recovery options
- Add bulk delete operations
- Add permission management UI 