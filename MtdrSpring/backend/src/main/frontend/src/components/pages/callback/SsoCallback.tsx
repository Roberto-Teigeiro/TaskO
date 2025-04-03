import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, useSignUp, useClerk, useUser } from "@clerk/clerk-react";

export default function SSOCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, getToken } = useAuth();
  const { signUp, setActive } = useSignUp();
  const clerk = useClerk();
  const { user } = useUser();
  const [status, setStatus] = useState("Processing authentication...");
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [formError, setFormError] = useState("");
  
  // Add username submit handler
  const handleUsernameSubmit = async (e:any) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setFormError("Username is required");
      return;
    }
    
    try {
      setStatus("Updating profile information...");
      
      // Update the user's username and name in Clerk
      if (user) {
        await user.update({
          username,
          firstName: fullName.split(' ')[0] || '',
          lastName: fullName.split(' ').slice(1).join(' ') || ''
        });

        // Now proceed with backend registration
        await registerUserInBackend();
      } else {
        setFormError("User not available. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormError("Failed to update profile. Please try again.");
    }
  };
  
  // Extract backend registration logic to a separate function
  const registerUserInBackend = async () => {
    setStatus("Registering with backend...");
    
    try {
      const template = 'TaskO';
      const token = await getToken({template});
      
      if (token) {
        // Register the user in your backend
        const response = await fetch('/api/newuser', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('OAuth user registered in backend successfully');
          setStatus("Registration complete, redirecting to dashboard...");
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          console.error('Failed to register OAuth user in backend:', await response.text());
          setStatus("Error registering with backend. Redirecting anyway...");
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } else {
        setFormError("Unable to get authentication token. Please try again.");
      }
    } catch (error) {
      console.error('Error registering OAuth user in backend:', error);
      setStatus("Error connecting to backend. Redirecting anyway...");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };
  
  useEffect(() => {
    async function processOAuthCallback() {
      try {
        // More comprehensive debugging
        console.log("--- OAuth Callback Debug ---");
        console.log("Current URL:", window.location.href);
        console.log("Location search:", location.search);
        console.log("Location hash:", location.hash);
        console.log("Cookies available:", document.cookie);
        console.log("SignUp object available:", !!signUp);
        console.log("User signed in:", isSignedIn);
        
        // Check if this is a fresh page load after OAuth redirect
        // We need to check if we have Clerk cookies but no query params
        if (document.cookie.includes("__clerk_db_jwt") && 
            !location.search && 
            window.location.href.includes("/callback")) {
          
          console.log("Detected OAuth callback with cookies but no params, manually processing...");
          setStatus("Processing OAuth authentication...");
          
          try {
            // Force complete the authentication since we've detected Clerk cookies
            if (isSignedIn) {
              console.log("User is already signed in, checking if username is set");
              
              if (user && (!user.username || user.username.trim() === "")) {
                console.log("Username not set, showing username form");
                // Pre-fill the name field if available from OAuth provider
                if (user.firstName || user.lastName) {
                  setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
                }
                setShowUsernameForm(true);
                return; // Don't proceed with registration yet
              }
              
              console.log("Username is set, proceeding with backend registration");
              await registerUserInBackend();
            } else {
              // Use the alternative approach with handleRedirectCallback instead
              try {
                console.log("OAuth cookies detected but user not signed in yet");
                
                // Try to handle the OAuth callback using the clerk instance
                try {
                  // Don't pass any redirectUrl parameter to prevent clerk from navigating away
                  await clerk.handleRedirectCallback({
                    // Specify your application's routes if needed
                    signInUrl: "/login", 
                    signUpUrl: "/register",
                    
                    // Optional: Use your own redirect URLs for when the process completes
                    signInFallbackRedirectUrl: "/dashboard",
                    signUpFallbackRedirectUrl: "/dashboard"
                  });
                  console.log("Clerk handleRedirectCallback processed successfully");
                  setStatus("Authentication successful!");
                  
                  // Wait for auth state to update
                  let attempts = 0;
                  const maxAttempts = 10;
                  
                  const checkAuthInterval = setInterval(async () => {
                    attempts++;
                    console.log(`Checking auth state, attempt ${attempts}`);
                    
                    if (isSignedIn && user) {
                      clearInterval(checkAuthInterval);
                      console.log("User now signed in after OAuth callback");
                      
                      if (!user.username || user.username.trim() === "") {
                        console.log("Username not set, showing username form");
                        // Pre-fill the name field if available from OAuth provider
                        if (user.firstName || user.lastName) {
                          setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
                        }
                        setShowUsernameForm(true);
                      } else {
                        console.log("Username is set, proceeding with backend registration");
                        await registerUserInBackend();
                      }
                    } else if (attempts >= maxAttempts) {
                      clearInterval(checkAuthInterval);
                      console.error("Timed out waiting for user to be signed in");
                      setStatus("Authentication error. Please try again.");
                      setTimeout(() => navigate("/login"), 3000);
                    }
                  }, 500); // Check every 500ms
                } catch (error) {
                  console.error("Error in handleRedirectCallback:", error);
                  setStatus("Error processing OAuth. Please try again.");
                  setTimeout(() => navigate("/login"), 3000);
                }
              } catch (error) {
                console.error("Error in OAuth callback handling:", error);
                setStatus("Authentication error. Please try again.");
                setTimeout(() => navigate("/login"), 3000);
              }
            }
          } catch (error) {
            console.error("Error in OAuth callback handling:", error);
            setStatus("Authentication error. Please try again.");
            setTimeout(() => navigate("/login"), 3000);
          }
        } else if (location.search.includes("__clerk_status=")) {
          // Standard Clerk redirect with query parameters
          console.log("Processing standard Clerk redirect with parameters");
          setStatus("Processing authentication parameters...");
          
          // Handle the standard flow with parameters
          const params = new URLSearchParams(location.search);
          const clerkStatus = params.get("__clerk_status");
          
          if (clerkStatus === "active") {
            setStatus("Authentication successful!");
            
            // Check if username is set
            setTimeout(() => {
              if (user && (!user.username || user.username.trim() === "")) {
                console.log("Username not set, showing username form");
                setShowUsernameForm(true);
              } else {
                navigate("/dashboard");
              }
            }, 1000);
          } else {
            console.error("Clerk status not active:", clerkStatus);
            setStatus("Authentication issue. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else if (isSignedIn) {
          console.log("User is already signed in, checking username");
          
          if (user && (!user.username || user.username.trim() === "")) {
            console.log("Username not set, showing username form");
            setShowUsernameForm(true);
          } else {
            navigate("/dashboard");
          }
        } else {
          console.log("Not in OAuth flow and not signed in");
          setStatus("Waiting for authentication...");
          // If we're on the callback page but nothing is happening, redirect to login
          setTimeout(() => {
            console.log("No authentication detected after timeout, redirecting to login");
            navigate("/login");
          }, 5000);
        }
      } catch (error) {
        console.error("Error in OAuth callback processing:", error);
        setStatus("Authentication error. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    }
    
    processOAuthCallback();
  }, [isSignedIn, navigate, getToken, location, signUp, setActive, clerk, user]);
  
  // Render username form if needed
  if (showUsernameForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ff6767]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
          
          <form onSubmit={handleUsernameSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="username">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6767]"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6767]"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                {formError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-[#ff6767] hover:bg-[#ff8787] text-white py-2 px-4 rounded-md transition duration-300"
            >
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // Default loading view
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ff6767]">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-pulse mb-4">
          <div className="h-12 w-12 mx-auto border-4 border-t-[#ff6767] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-semibold">{status}</p>
        <p className="text-sm text-gray-500 mt-4">Processing OAuth authentication...</p>
        {/* Debug info - remove in production */}
        <div className="mt-4 text-xs text-left text-gray-500 overflow-hidden">
          <p>URL: {window.location.href.substring(0, 40)}...</p>
          <p>Params: {location.search || "none"}</p>
          <p>Auth: {isSignedIn ? "Signed In" : "Not Signed In"}</p>
        </div>
      </div>
    </div>
  );
}