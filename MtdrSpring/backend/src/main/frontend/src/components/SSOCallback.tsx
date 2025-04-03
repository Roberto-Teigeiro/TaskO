import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function SSOCallback() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  
  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);
  
  return <div>Procesando autenticación...</div>;
}