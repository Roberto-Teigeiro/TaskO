import { useState, useCallback } from 'react';

interface UserCache {
  [userId: string]: string;
}

export const useUserResolver = () => {
  const [userCache, setUserCache] = useState<UserCache>({});

  const resolveUserNames = useCallback(async (userIds: string[]): Promise<UserCache> => {
    // Filtrar IDs que ya están en cache
    const uncachedIds = userIds.filter(id => !userCache[id]);
    
    if (uncachedIds.length === 0) {
      // Todos los usuarios ya están en cache
      return userIds.reduce((acc, id) => {
        acc[id] = userCache[id];
        return acc;
      }, {} as UserCache);
    }

    try {
      const isLocalhost = window.location.hostname === 'localhost';
      const url = isLocalhost 
        ? 'http://localhost:8080/resolveusername' 
        : '/api/resolveusername';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uncachedIds),
      });
      
      if (response.ok) {
        const resolvedUsers = await response.json();
        
        // Actualizar cache
        setUserCache(prev => ({ ...prev, ...resolvedUsers }));
        
        // Devolver todos los usuarios solicitados (cached + nuevos)
        return userIds.reduce((acc, id) => {
          acc[id] = resolvedUsers[id] || userCache[id] || `User ${id.replace('user_', '').substring(0, 8)}`;
          return acc;
        }, {} as UserCache);
      }
    } catch (error) {
      console.error('Error resolving user names:', error);
    }
    
    // Fallback: usar cache existente y generar nombres para los que fallan
    return userIds.reduce((acc, id) => {
      acc[id] = userCache[id] || `User ${id.replace('user_', '').substring(0, 8)}`;
      return acc;
    }, {} as UserCache);
  }, [userCache]);

  return { resolveUserNames, userCache };
};