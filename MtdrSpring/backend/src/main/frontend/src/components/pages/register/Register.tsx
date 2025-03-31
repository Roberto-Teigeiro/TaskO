///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/register/Register.tsx
"use client"
import { useNavigate } from "react-router-dom" 
import type React from "react"

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User } from "lucide-react"

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    
  })
  const navigate = useNavigate();

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreeTerms: checked,
    }))
  }
  const toLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    navigate("/login");

  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userData", JSON.stringify(formData)); // Guardar en localStorage
    navigate("/dashboard");
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
                value={formData.firstName}
                onChange={handleChange}
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
                value={formData.lastName}
                onChange={handleChange}
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
                value={formData.username}
                onChange={handleChange}
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
                value={formData.email}
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 py-6 rounded-md"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={formData.agreeTerms} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="terms" className="text-sm">
                I agree to all terms
              </Label>
            </div>

            <Button type="submit" className="w-full py-6 bg-[#ff6767] hover:bg-[#ff5252] text-white">
              Register
            </Button>
          </form>

          <p className="text-center mt-6">
            Already have an account?{" "}
            <Button onClick={toLogin} className="text-white bg-red-400 hover:underline">
              Sign In
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}

