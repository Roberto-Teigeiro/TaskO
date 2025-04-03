///Users/santosa/Documents/GitHub/oraclefront/src/components/Sidebar.tsx
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CircleDot, LayoutGrid, LogOut, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react"; // Importar Clerk's useAuth para manejar la sesión

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth(); // Clerk's signOut para cerrar sesión
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

  const handleLogout = async () => {
    try {
      // Eliminar sesión de Clerk
      await signOut();

      // Limpiar localStorage
      localStorage.removeItem("userData");

      // Redirigir al usuario a la página de inicio (login)
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  const handleMyTask = () => {
    navigate("/tasks");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleSprints = () => {
    navigate("/sprints");
  };

  const handleCalendar = () => {
    navigate("/calendar");
  };

  return (
    <div className="hidden md:flex w-64 bg-[#ff6b6b] text-white flex-col">
      <div className="p-6 flex flex-col items-center text-center">
        <Avatar className="w-20 h-20 border-2 border-white">
          <AvatarImage
            src={userData.profilePicture || "/placeholder.svg?height=80&width=80"}
            alt={`${userData.firstName} ${userData.lastName}`}
          />
          <AvatarFallback>
            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-2 font-semibold text-lg">{userData.firstName} {userData.lastName}</h3>
        <p className="text-xs text-white/80">{userData.email}</p>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          <Button
            onClick={handleDashboard}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/20 rounded-xl ${
              location.pathname === "/dashboard" ? "bg-white/30" : ""
            }`}
          >
            <LayoutGrid className="mr-2 h-5 w-5" />
            Dashboard
          </Button>

          <Button
            onClick={handleSprints}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/20 rounded-xl ${
              location.pathname === "/sprints" ? "bg-white/30" : ""
            }`}
          >
            <CircleDot className="mr-2 h-5 w-5" />
            Sprints
          </Button>

          <Button
            onClick={handleCalendar}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/20 rounded-xl ${
              location.pathname === "/calendar" ? "bg-white/30" : ""
            }`}
          >
            <CircleDot className="mr-2 h-5 w-5" />
            Calendar
          </Button>

          <Button
            onClick={handleMyTask}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/20 rounded-xl ${
              location.pathname === "/tasks" ? "bg-white/30" : ""
            }`}
          >
            <CircleDot className="mr-2 h-5 w-5" />
            My Task
          </Button>

          <Button
            onClick={handleSettings}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/20 rounded-xl ${
              location.pathname === "/settings" ? "bg-white/30" : ""
            }`}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </div>
      </nav>

      <div className="p-4">
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
}
