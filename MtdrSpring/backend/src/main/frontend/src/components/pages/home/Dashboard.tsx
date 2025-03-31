///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/home/Dashboard.tsx
"use client"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CircleDot, Plus } from "lucide-react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { TaskItem, CompletedTaskItem } from "@/components/ui/Task-item"
import { ProgressCircle } from "@/components/ui/Progress-circle"

export default function Dashboard() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
  });

  useEffect(() => {
    const loadUserData = () => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    };

    loadUserData();
    window.addEventListener("userDataUpdated", loadUserData);

    return () => {
      window.removeEventListener("userDataUpdated", loadUserData);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      <Header day="Tuesday" date="20/06/2023" title="Dash" titleSpan="Board"/>

      <div className="flex flex-1">
        <Sidebar />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Welcome back, {userData.firstName} {userData.lastName} 👋</h2>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src={userData.profilePicture || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{userData.firstName.charAt(0)}{userData.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>U4</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>U5</AvatarFallback>
                </Avatar>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/10"
              >
                <Plus className="h-4 w-4 mr-1" /> Invite
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <CircleDot className="text-[#ff6b6b]" />
                    <h3 className="font-medium text-[#ff6b6b]">To-Do</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>20 June</span>
                    <span>•</span>
                    <span>Today</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <TaskItem
                    title="Attend Nischal's Birthday Party"
                    description="Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements)..."
                    priority="Moderate"
                    status="Not Started"
                    date="20/06/2023"
                    image="/placeholder.svg?height=80&width=80"
                  />

                  <TaskItem
                    title="Landing Page Design for TravelDays"
                    description="Get the work done by EOD and discuss with client before leaving (4 PM | Meeting Room)"
                    priority="Moderate"
                    status="In Progress"
                    date="20/06/2023"
                    image="/placeholder.svg?height=80&width=80"
                  />

                  <TaskItem
                    title="Presentation on Final Product"
                    description="Make sure everything is functioning and all the necessities are properly met. Prepare the team and get the documents ready for..."
                    priority="Moderate"
                    status="In Progress"
                    date="20/06/2023"
                    image="/placeholder.svg?height=80&width=80"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium mb-4">Task Status</h3>

                  <div className="flex justify-around items-center">
                    <ProgressCircle value={40} color="#32CD32" label="Completed" />
                    <ProgressCircle value={40} color="#4169E1" label="In Progress" />
                    <ProgressCircle value={20} color="#ff6b6b" label="Not Started" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CircleDot className="text-[#32CD32]" />
                    <h3 className="font-medium text-gray-700">Completed Tasks</h3>
                  </div>

                  <div className="space-y-3">
                    <CompletedTaskItem
                      title="Add New colors to UI"
                      description="Added new colors to UI for consistency"
                      daysAgo={2}
                      image=""
                    />

                    <CompletedTaskItem
                      title="Conduct meeting"
                      description="Meet with the client and finalize requirements."
                      daysAgo={2}
                      image=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}