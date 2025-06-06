/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAuth } from "@clerk/react-router";
import NewProjectModal from "./NewProjectModal";
import JoinProjectModal from "./JoinProjectModal";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Users, FolderPlus } from "lucide-react";
import { Header } from "../../Header";
const Choosepath = () => {
  const [showProjectModal, setProjectModal] = useState(false);
  const [showJoinProjectModal, setJoinProjectModal] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("userData");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  const toggleCreateModal = () => setProjectModal(!showProjectModal);
  const toggleJoinModal = () => setJoinProjectModal(!showJoinProjectModal);

  return (
    <div>
    <Header title="Choose Path!" />
    <div className="min-h-screen w-full bg-[#312D2A] flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row p-8 gap-8">
        {/* Join Project Card */}
        <div 
          className="w-full md:w-1/2 relative rounded-lg overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer group"
          onClick={toggleJoinModal}
        >
          <div className="absolute inset-0 bg-[#3F3A36] opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-8 flex flex-col items-center justify-center h-full">
            <Users className="w-16 h-16 text-[#C74634] mb-6" />
            <h2 className="text-3xl font-medium text-white mb-4">Join a Project</h2>
            <p className="text-lg text-gray-300 text-center max-w-md mb-8">
              Collaborate with others on exciting projects that match your skills and interests.
            </p>
            <button className="px-8 py-3 bg-[#C74634] text-white font-medium rounded hover:bg-[#B33D2B] transition-colors">
              Find Projects
            </button>
          </div>
        </div>

        {/* Create Project Card */}
        <div 
          className="w-full md:w-1/2 relative rounded-lg overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer group"
          onClick={toggleCreateModal}
        >
          <div className="absolute inset-0 bg-[#3F3A36] opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-8 flex flex-col items-center justify-center h-full">
            <FolderPlus className="w-16 h-16 text-[#C74634] mb-6" />
            <h2 className="text-3xl font-medium text-white mb-4">Create a Project</h2>
            <p className="text-lg text-gray-300 text-center max-w-md mb-8">
              Launch your own project and bring your ideas to life with a team of collaborators.
            </p>
            <button className="px-8 py-3 bg-[#C74634] text-white font-medium rounded hover:bg-[#B33D2B] transition-colors">
              Start Now
            </button>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="p-6 bg-[#3F3A36]">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="mx-auto flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#4A4541] rounded px-4 py-2 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="relative bg-[#312D2A] rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto overflow-hidden border border-[#4A4541]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C74634]"></div>
            <button
              onClick={toggleCreateModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <NewProjectModal />
          </div>
        </div>
      )}

      {/* Join Project Modal */}
      {showJoinProjectModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="relative bg-[#312D2A] rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto overflow-hidden border border-[#4A4541]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#C74634]"></div>
            <button
              onClick={toggleJoinModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <JoinProjectModal />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Choosepath;
