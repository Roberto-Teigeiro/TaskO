///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/login/Login.tsx
"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Lock, User } from "lucide-react"

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const navigate = useNavigate();
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toRegister = (e: React.FormEvent) => {
    e.preventDefault()
    // Add your navigation logic here
    navigate("/")
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const user = JSON.parse(storedData);
      if (user.username === formData.username && user.password === formData.password) {
        localStorage.setItem("isLoggedIn", "true"); // Guardar estado de sesión
        navigate("/dashboard");
      } else {
        alert("Invalid username or password");
      }
    } else {
      alert("User not found");
    }
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
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
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
              <Button variant="outline" size="icon" className="rounded-md w-10 h-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-[#3b5998]">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-md w-10 h-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="w-5 h-5">
                  <path
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    fill="#4285f4"
                  />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-md w-10 h-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5">
                  <path
                    d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                    fill="#000"
                  />
                </svg>
              </Button>
            </div>
          </div>

          <p className="text-center mt-8">
            Don't have an account?{" "}
            <Button onClick={toRegister} className="bg-red-400 text-white hover:underline ">
              Create One
            </Button>
          </p>
        </div>

        {/* Right side - Illustration */}
        <div className=" md:block md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
          <img src="/placeholder.svg?height=400&width=400" alt="" className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  )
}

