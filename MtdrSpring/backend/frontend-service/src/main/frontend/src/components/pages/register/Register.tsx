///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/register/Register.tsx
"use client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useSignUp, useUser, useAuth } from "@clerk/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

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
    setError(null);
    setLoading(true);

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
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
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        localStorage.setItem("userData", JSON.stringify(userData));

        await setActive({ session: result.createdSessionId });
        const template = "TaskO";
        // Get the JWT token after successful authentication
        const token = await getToken({ template });
        console.log("user token: " + token);
        // Send the JWT token to your backend
        if (token) {
          try {
            const response = await fetch("/api/newuser", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              console.log("User registered in backend successfully");
            } else {
              console.error(
                "Failed to register user in backend:",
                await response.text(),
              );
            }
          } catch (error) {
            console.error("Error registering user in backend:", error);
          }
        }

        navigate("/Dashboard");
      } else if (result.status === "missing_requirements") {
        const missingFields = result.missingFields || [];
        if (missingFields.includes("email_address")) {
          setError("Please verify your email address");
        } else {
          // Show exactly which fields are missing
          setError(
            `Please complete the following: ${missingFields.join(", ")}`,
          );
          console.log("Missing fields:", missingFields);
        }
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setError(error.message ?? "Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Corrected OAuth handler using correct parameters
  const signUpWithOAuth = async (provider: "oauth_github" | "oauth_google") => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      // Add a parameter to indicate this is a new user
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `/sso-callback`, // Use exact URL, not window.location.origin
        redirectUrlComplete: `/dashboard`,
      });
    } catch (error: any) {
      console.error(`Error signing up with ${provider}:`, error);
      setError(`Failed to sign up with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex">
        {/* Left side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-100 to-red-200 items-center justify-center p-8">
          <div className="text-center">
            <img
              src="/placeholder.svg?height=300&width=300"
              alt="Oracle Project Management"
              className="max-w-full h-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Oracle Project Management
            </h2>
            <p className="text-gray-600">
              Manage your development team efficiently with our Cloud Native
              solution.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center mb-8">
            Create Account
          </h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="pl-10 py-6 rounded-md"
                  required
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="pl-10 py-6 rounded-md"
                  required
                  disabled={loading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                name="username"
                placeholder="Username"
                className="pl-10 py-6 rounded-md"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                className="pl-10 py-6 rounded-md"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="pl-10 py-6 rounded-md"
                  required
                  disabled={loading}
                  autoComplete="new-password"
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
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="agreeTerms"
                required
                disabled={loading}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <span className="text-red-600 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-red-600 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400">
                Or sign up with
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center space-x-4 mt-4">
              {/* GitHub button */}
              <button
                type="button"
                className="flex items-center justify-center rounded-md w-12 h-12 border border-gray-200 hover:bg-gray-50"
                onClick={() => signUpWithOAuth("oauth_github")}
                aria-label="Sign up with GitHub"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </button>

              {/* Google button */}
              <button
                type="button"
                className="flex items-center justify-center rounded-md w-12 h-12 border border-gray-200 hover:bg-gray-50"
                onClick={() => signUpWithOAuth("oauth_google")}
                aria-label="Sign up with Google"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                  className="w-6 h-6"
                >
                  <path
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    fill="#4285f4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-center mt-6">
            Already have an account?{" "}
            <Button
              onClick={toLogin}
              variant="link"
              className="text-red-600 hover:text-red-800 p-0"
              disabled={loading}
            >
              Sign In
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
