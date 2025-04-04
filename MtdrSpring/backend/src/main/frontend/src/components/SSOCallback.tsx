/* eslint-disable @typescript-eslint/no-explicit-any */
///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/components/SSOCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const navigate = useNavigate();
  const { handleRedirectCallback } = useClerk();
  const [error, setError] = useState(null);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">Error: {error}</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {isProcessing && <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />}
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          {isProcessing ? "Processing authentication..." : "Authentication complete"}
        </h2>
        <p className="text-gray-700">
          {isProcessing ? "Please wait while we complete your sign-in" : "Redirecting you now..."}
        </p>
      </div>
    </div>
  );
}
