///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/login/Login.tsx
"use client"

import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Lock, User } from "lucide-react"
import { useSignIn, useUser } from "@clerk/react-router"

export default function Login() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { signIn, setActive, isLoaded } = useSignIn();
  
  useEffect(() => {
    // Redirect to dashboard if already signed in
    if (isSignedIn) {
      navigate("/Dashboard");
    }
  }, [isSignedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    // Not using rememberMe right now but keeping the checkbox for UI consistency
    
    try {
      const result = await signIn.create({
        identifier: username,
        password,
      });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/Dashboard");
      } else {
        // Handle other statuses like 2FA if applicable
        console.log("Sign in status:", result.status);
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      alert(error.message || "Invalid username or password");
    }
  };

  // OAuth handlers
  const signInWithOAuth = async (provider: "oauth_github" | "oauth_google") => {
    if (!isLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/Dashboard",
        redirectUrlComplete: "/Dashboard"
      });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      alert(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  const toRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#ff6767] flex items-center justify-center p-4 bg-pattern">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                name="username"
                placeholder="Enter Username or Email"
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="password"
                name="password"
                placeholder="Enter Password"
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" name="rememberMe" />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember Me
              </Label>
            </div>

            <Button type="submit" className="w-full py-6 bg-[#ff6767] hover:bg-[#ff5252] text-white">
              Login
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-center text-gray-500 mb-4">Or, Login with</p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-md w-10 h-10"
                onClick={() => signInWithOAuth("oauth_github")}
              >
                {/* Replaced deprecated Github component with SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-md w-10 h-10"
                onClick={() => signInWithOAuth("oauth_google")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="w-5 h-5">
                  <path
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    fill="#4285f4"
                  />
                </svg>
              </Button>
            </div>
          </div>

          <p className="text-center mt-8">
            Don't have an account?{" "}
            <Button onClick={toRegister} className="bg-red-400 text-white hover:underline">
              Create One
            </Button>
          </p>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden md:block md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
          <img src="/placeholder.svg?height=400&width=400" alt="" className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  );
}