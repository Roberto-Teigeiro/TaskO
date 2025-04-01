///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/home/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CircleDot, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TaskItem, CompletedTaskItem } from "@/components/ui/Task-item";
import { ProgressCircle } from "@/components/ui/Progress-circle";
import { useUser } from "@clerk/react-router";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
  });

  useEffect(() => {
    const loadUserData = () => {
      // Check if Clerk is loaded
      if (isLoaded) {
        if (user) {
          const clerkUserData = {
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            email: user.emailAddresses[0]?.emailAddress ?? "",
            profilePicture: user.imageUrl ?? "",
          };

          setUserData(clerkUserData);

          // Sync with localStorage
          localStorage.setItem("userData", JSON.stringify(clerkUserData));
          return;
        }
      }

      // Fallback to localStorage if Clerk data isn't available
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          setUserData(JSON.parse(storedData));
        } catch (e) {
          console.error("Error parsing userData from localStorage", e);
        }
      }
    };

    loadUserData();
    window.addEventListener("userDataUpdated", loadUserData);

    return () => {
      window.removeEventListener("userDataUpdated", loadUserData);
    };
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Header */}
      <Header day="Tuesday" date="20/06/2023" title="Dash" titleSpan="Board" />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="p-6 flex-1">
          {/* Welcome Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Welcome back, {userData.firstName} {userData.lastName} 👋
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src={userData.profilePicture || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>
                    {userData.firstName.charAt(0) ?? "U"}
                    {userData.lastName.charAt(0) ?? "S"}
                  </AvatarFallback>
                </Avatar>
                {[...Array(4)].map((_, i) => (
                  <Avatar key={i} className="border-2 border-white w-8 h-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>U{i + 2}</AvatarFallback>
                  </Avatar>
                ))}
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

          {/* Task Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* To-Do Tasks */}
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

                {/* Task Items */}
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <TaskItem
                      key={i}
                      title={`Task ${i + 1}`}
                      description={`Description for task ${i + 1}`}
                      priority={i % 2 === 0 ? "High" : "Moderate"}
                      status={i % 3 === 0 ? "Not Started" : "In Progress"}
                      date={`20/06/2023`}
                      image="/placeholder.svg?height=80&width=80"
                    />
                  ))}
                </div>
              </div>

              {/* Task Status and Completed Tasks */}
              <div className="space-y-6">
                {/* Task Status */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium mb-4">Task Status</h3>

                  {/* Progress Circles */}
                  <div className="flex justify-around items-center">
                    <ProgressCircle value={40} color="#32CD32" label="Completed" />
                    <ProgressCircle value={40} color="#4169E1" label="In Progress" />
                    <ProgressCircle value={20} color="#ff6b6b" label="Not Started" />
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-4">Completed Tasks</h3>

                  {/* Completed Task Items */}
                  {[...Array(2)].map((_, i) => (
                    <CompletedTaskItem
                      key={i}
                      title={`Completed Task ${i + 1}`}
                      description={`Details about completed task ${i + 1}`}
                      daysAgo={i + 1}
                      image=""
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
