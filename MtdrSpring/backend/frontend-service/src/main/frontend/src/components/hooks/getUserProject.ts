
export const getUserProject = async (userId: string) => {
    try {
    const response = await fetch(`http://localhost:8080/projects/${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    const data = await response.json()
    
    return data 
    
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}