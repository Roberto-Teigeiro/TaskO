///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/register/Register.tsx
"use client"
import { useNavigate } from "react-router-dom" 
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User } from "lucide-react"
import { useSignUp, useUser } from "@clerk/react-router"

export default function Register() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { signUp, setActive, isLoaded } = useSignUp();
  
  useEffect(() => {
    // Redirect to dashboard if already signed in
    if (isSignedIn) {
      navigate("/Dashboard");
    }
  }, [isSignedIn, navigate]);

  const toLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/Login");
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoaded) return;

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Only include required fields in the signUp.create() call
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password: password,
        username: username,
      });

      if (result.status === "complete") {
        // Store optional fields (firstName, lastName) in localStorage or update user profile later
        const userData = {
          firstName,
          lastName,
          username,
          email,
          profilePicture: "",
        };
        localStorage.setItem("userData", JSON.stringify(userData));

        await setActive({ session: result.createdSessionId });
        navigate("/Dashboard");
      } else if (result.status === "missing_requirements") {
        const missingFields = result.missingFields || [];
        if (missingFields.includes("email_address")) {
          alert("Please verify your email address");
        } else {
          // Show exactly which fields are missing
          alert(`Please complete the following: ${missingFields.join(", ")}`);
          console.log("Missing fields:", missingFields);
        }
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      alert(error.message || "Error creating account. Please try again.");
    }
  };

  // OAuth handlers - Fixed version
  const signUpWithOAuth = async (provider: "oauth_github" | "oauth_google") => {
    if (!isLoaded) return;
    
    try {
      // Make sure these URLs match your application routes
      const redirectUrl = `${window.location.origin}/Dashboard`;
      const redirectUrlComplete = `${window.location.origin}/Dashboard`;
      
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl,
        redirectUrlComplete
      });
    } catch (error) {
      console.error(`Error signing up with ${provider}:`, error);
      alert(`Failed to sign up with ${provider}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#ff6767] flex items-center justify-center p-4 bg-pattern">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex">
        {/* Left side - Illustration */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
          <img
            src="/placeholder.svg?height=500&width=400"
            alt=""
            className="max-w-full h-auto"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                name="firstName"
                placeholder="Enter First Name"
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                name="lastName"
                placeholder="Enter Last Name"
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                name="username"
                placeholder="Enter Username"
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="email"
                name="email"
                placeholder="Enter Email" 
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" name="agreeTerms" required />
              <Label htmlFor="terms" className="text-sm">
                I agree to all terms
              </Label>
            </div>

            <Button type="submit" className="w-full py-6 bg-[#ff6767] hover:bg-[#ff5252] text-white">
              Register
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-center text-gray-500 mb-4">Or, Sign Up with</p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-md w-10 h-10"
                onClick={() => signUpWithOAuth("oauth_github")}
              >
                {/* Replaced deprecated Github component with SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-md w-10 h-10"
                onClick={() => signUpWithOAuth("oauth_google")}
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

          <p className="text-center mt-6">
            Already have an account?{" "}
            <Button onClick={toLogin} className="text-white bg-red-400 hover:underline">
              Sign In
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}