export const getUserProject = async (userId: string) => {
  try {
    const response = await fetch(`/api/projects/${userId}`);
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
