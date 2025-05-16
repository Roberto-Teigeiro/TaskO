export const getUserProject = async (userId: string) => {
    const isLocalhost = window.location.hostname === 'localhost';

    const API_URL = isLocalhost
      ? `http://localhost:8080/projects/${userId}`
      : `/api/projects/${userId}`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
};
