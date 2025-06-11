// /Users/santosa/Documents/GitHub/oraclefront/src/components/Sidebar.tsx
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutGrid, LogOut, Settings, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react"; // Importar useAuth y useUser de Clerk
import oracleLogo from "../assets/oracleLogo.svg";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth(); // Clerk's signOut para manejar la sesión
  const { user, isLoaded } = useUser(); // Obtener datos del usuario de Clerk
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
  });

  useEffect(() => {
    // Actualizar los datos del usuario cuando Clerk carga o cambia el usuario
    if (isLoaded && user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        profilePicture: user.imageUrl || "",
      });
    }
  }, [user, isLoaded]);

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
    <div className="hidden md:flex w-64 bg-[#C74634] text-white h-screen sticky top-18 flex-col border-r border-gray-200 shadow-lg">
      <div className="p-6 flex flex-col items-center text-center border-b border-white/20">
        <Avatar className="w-20 h-20 border-2 border-white shadow-lg">
          <AvatarImage
            src={
              userData.profilePicture || oracleLogo
            }
            alt={`${userData.firstName} ${userData.lastName}`}
          />
          <AvatarFallback>
            {userData.firstName.charAt(0) || "?"}
            {userData.lastName.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-2 font-semibold text-lg tracking-wide">{userData.firstName} {userData.lastName}</h3>
        <p className="text-xs text-white/80 font-light">{userData.email}</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <Button
            onClick={handleDashboard}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
              location.pathname === "/dashboard" ? "bg-white/20 font-medium" : ""
            }`}
          >
            <LayoutGrid className="mr-2 h-5 w-5" />
            Dashboard
          </Button>

          <Button
            onClick={handleSprints}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
              location.pathname === "/sprints" ? "bg-white/20 font-medium" : ""
            }`}
          >
            <Zap className="mr-2 h-5 w-5" />
            Sprints
          </Button>

          <Button
            onClick={handleCalendar}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
              location.pathname === "/calendar" ? "bg-white/20 font-medium" : ""
            }`}
          >
            <Calendar className="mr-2 h-5 w-5" />
            Calendar
          </Button>

          

          <Button
            onClick={handleSettings}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
              location.pathname === "/settings" ? "bg-white/20 font-medium" : ""
            }`}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </div>
      </nav>

      <div className="p-4 mb-18 justify-center items-center border-t border-white/20">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
