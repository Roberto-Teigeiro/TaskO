/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react-router";
import NewProjectModal from "./NewProjectModal";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Choosepath = () => {
  const { user } = useUser();
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [showProjectModal, setProjectModal] = useState(false);
  const [showJoinProjectModal, setJoinProjectModal] = useState(false);
  const { signOut } = useAuth(); // Clerk's signOut para manejar la sesión
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(); // Cerrar sesión
      localStorage.removeItem("userData"); // Limpiar localStorage
      navigate("/"); // Redirigir al login
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  useEffect(() => {
    const fetchAuth = async () => {
      if (user) {
        const publicMetadata = user.publicMetadata;
        setUserMetadata(publicMetadata);
        console.log(userMetadata);
      }
    };

    fetchAuth();
  }, [user]);

  const toggleCreateModal = () => setProjectModal(!showProjectModal);
  const toggleJoinModal = () => setJoinProjectModal(!showJoinProjectModal);

  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden">
      {/* Left side - Join Project */}
      <div
        className="w-1/2 h-full relative transition-all duration-500 ease-in-out hover:w-3/5 group cursor-pointer"
        onClick={toggleJoinModal}
      >
        <div className="absolute inset-0 bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-200"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-10 max-w-xl transition-all duration-500 group-hover:scale-110">
            <div className="mb-6 mx-auto">
              <svg
                className="w-20 h-20 mx-auto text-indigo-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-indigo-800 mb-6">
              Join a Project
            </h2>
            <p className="text-xl text-indigo-700">
              Collaborate with others on exciting projects that match your
              skills and interests.
            </p>
            <div className="mt-8">
              <span className="inline-block px-8 py-3 bg-indigo-600 text-white font-medium text-lg rounded-lg shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:bg-indigo-700">
                Find Projects
              </span>
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-300 z-10"></div>
      </div>

      {/* Right side - Create Project */}
      <div
        className="w-1/2 h-full relative transition-all duration-500 ease-in-out hover:w-3/5 group cursor-pointer"
        onClick={toggleCreateModal}
      >
        <div className="absolute inset-0 bg-purple-100 transition-all duration-500 group-hover:bg-purple-200"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-10 max-w-xl transition-all duration-500 group-hover:scale-110">
            <div className="mb-6 mx-auto">
              <svg
                className="w-20 h-20 mx-auto text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-purple-800 mb-6">
              Create a Project
            </h2>
            <p className="text-xl text-purple-700">
              Launch your own project and bring your ideas to life with a team
              of collaborators.
            </p>
            <div className="mt-8">
              <span className="inline-block px-8 py-3 bg-purple-600 text-white font-medium text-lg rounded-lg shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:bg-purple-700">
                Start Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 overflow-y-auto"
          style={{
            animation: "fadeIn 0.2s ease-out forwards",
          }}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto overflow-hidden"
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
            <button
              onClick={toggleCreateModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
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
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 overflow-y-auto"
          style={{
            animation: "fadeIn 0.2s ease-out forwards",
          }}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto overflow-hidden"
            style={{
              animation: "slideUp 0.3s ease-out forwards",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <button
              onClick={toggleJoinModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
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
            <div className="p-6">
              <h2 className="text-2xl font-bold text-indigo-800 mb-4">
                Join a Project
              </h2>
              <p className="text-gray-600 mb-6">
                This feature is coming soon. Check back later!
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 absolute bottom-0 left-0 right-0 bg-red-300">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/20 rounded-xl"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Choosepath;
