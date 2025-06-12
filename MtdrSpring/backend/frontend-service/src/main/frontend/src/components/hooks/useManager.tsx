import { useState, useEffect, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";

export const useManager = (projectId: string | null) => {
  const { userMetadata } = useProjects();
  
  // Use the same logic as Dashboard.tsx - check userMetadata?.manager === true
  const isManager = useMemo(() => userMetadata?.manager === true, [userMetadata?.manager]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Since we're using userMetadata, we don't need to make API calls
  // The loading state should be based on whether userMetadata is available
  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      setError("No project selected");
      return;
    }

    // If userMetadata is not loaded yet, we're still loading
    if (userMetadata === undefined) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoading(false);
      setError(null);
    }
  }, [projectId, userMetadata]);

  return {
    isManager,
    isLoading,
    error,
  };
}; 