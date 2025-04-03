///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/components/SSOCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const navigate = useNavigate();
  const { handleRedirectCallback } = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processCallback() {
      try {
        console.log("Processing OAuth callback at:", window.location.href);
        
        // Pass the current URL as the redirectUrl parameter
        await handleRedirectCallback({
          redirectUrl: window.location.href
        });
        
        console.log("Authentication successful, redirecting to dashboard");
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Error during OAuth callback:", error);
        setError(error.message || "Authentication failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
    
    processCallback();
  }, [navigate, handleRedirectCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4 text-lg font-bold">Error: {error}</div>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Use isProcessing in conditional rendering
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {isProcessing && <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600 mb-4" />}
        <h2 className="text-xl font-bold mb-2">
          {isProcessing ? "Processing authentication..." : "Authentication complete"}
        </h2>
        <p className="text-gray-600">
          {isProcessing ? "Please wait while we complete your sign-in" : "Redirecting you now..."}
        </p>
      </div>
    </div>
  );
}