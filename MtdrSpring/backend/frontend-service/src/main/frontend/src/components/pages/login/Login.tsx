///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/login/Login.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useSignIn, useUser } from "@clerk/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to dashboard if already signed in
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  // Add this useEffect to handle OAuth redirects
  useEffect(() => {
    // Check if this is a redirect from OAuth (has hash params)
    if (window.location.hash && isLoaded) {
      const urlParams = new URLSearchParams(window.location.hash.substring(1)); // Cambia de #? a #
      const redirectUrl = urlParams.get("redirect_url");

      // Si hay un redirect_url, navega a esa ruta
      if (redirectUrl) {
        navigate(redirectUrl);
      }
    }
  }, [isLoaded, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn.create({
        identifier: username,
        password,
      });

      if (result.status === "complete") {
        // Update last login time in user data
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          parsedData.lastLogin = new Date().toISOString();
          localStorage.setItem("userData", JSON.stringify(parsedData));
        }

        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else if (result.status === "needs_second_factor") {
        // Handle 2FA if implemented
        setError(
          "Two-factor authentication required. Please check your authentication app.",
        );
      } else {
        // Handle other statuses
        setError("Sign in incomplete. Please try again.");
        console.log("Sign in status:", result.status);
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      setError(error.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: "oauth_github" | "oauth_google") => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      // Use the correct path to your SSO callback component
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `/sso-callback`, // Use exact URL, not window.location.origin
        redirectUrlComplete: `/dashboard`,
      });
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const toRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8">Welcome Back</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                name="username"
                placeholder="Username or Email"
                className="pl-10 py-6 rounded-md"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="pl-10 py-6 rounded-md"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember Me
                </Label>
              </div>
              <Button
                variant="link"
                className="text-red-600 hover:text-red-800 p-0"
                disabled={loading}
              >
                Forgot Password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400">
                Or sign in with
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center space-x-4 mt-4">
              {/* GitHub button */}
              <button
                type="button"
                className="flex items-center justify-center rounded-md w-12 h-12 border border-gray-200 hover:bg-gray-50"
                onClick={() => signInWithOAuth("oauth_github")}
                aria-label="Sign in with GitHub"
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
                onClick={() => signInWithOAuth("oauth_google")}
                aria-label="Sign in with Google"
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

          <p className="text-center mt-8">
            Don't have an account?{" "}
            <Button
              onClick={toRegister}
              variant="link"
              className="text-red-600 hover:text-red-800 p-0"
              disabled={loading}
            >
              Create One
            </Button>
          </p>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-100 to-red-200 items-center justify-center p-8">
          <div className="text-center">
            <img
              src="/placeholder.svg?height=300&width=300"
              alt="Project Management"
              className="max-w-full h-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Oracle Project Management - FIX
            </h2>
            <p className="text-gray-600">
              Boost your team's productivity with our cloud-native task
              management solution.
            </p>
            <div className="mt-6 bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-gray-700 text-sm italic">
                "DevOps is the emerging professional movement that advocates a
                collaborative working relationship between Development and IT
                Operations."
              </p>
              <p className="text-gray-600 text-sm mt-2">— Gene Kim</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
