/* eslint-disable @typescript-eslint/no-explicit-any */
///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/home/Settings.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { User, Shield, HelpCircle, Mail, AtSign, Camera, Loader2, Bell, Globe, Lock, ChevronsUpDown, Check } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useUser } from "@clerk/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Create types for the missing components
// These types would normally come from the actual component libraries

// For the Switch component
type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// Create a dummy Switch component to use until you can properly install the component
const Switch = ({ checked, onCheckedChange }: SwitchProps) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
        checked ? "bg-red-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`${
          checked ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </button>
  );
};

// For the Dropdown Menu components
interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

// Fixed: Removed unused 'asChild' parameter
const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

const DropdownMenuContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setIsOpen(true);
    
    const handleClickOutside = () => {
      setIsOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${className ?? ""}`}>
      <div className="py-1">{children}</div>
    </div>
  );
};

const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-4 py-2 text-sm font-medium text-gray-700">{children}</div>;
};

const DropdownMenuSeparator = () => {
  return <div className="my-1 h-px bg-gray-200"></div>;
};

const DropdownMenuItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

export default function Settings() {
  const { user, isLoaded: userLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("account");
  
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePicture: "",
    bio: "",
    location: "",
    company: "",
    website: "",
    theme: "light",
    language: "english",
    timeZone: "UTC",
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });

  const languages = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
  ];

  const timeZones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "EST", label: "EST (Eastern Standard Time)" },
    { value: "CST", label: "CST (Central Standard Time)" },
    { value: "PST", label: "PST (Pacific Standard Time)" },
    { value: "CET", label: "CET (Central European Time)" },
  ];

  useEffect(() => {
    const loadUserData = () => {
      // Try to get data from Clerk first
      if (user) {
        setUserData(prevData => ({
          ...prevData,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          username: user.username ?? "",
          email: user.emailAddresses[0]?.emailAddress ?? "",
          profilePicture: user.imageUrl ?? "",
          // Keep other fields from previous state
        }));
        return;
      }

      // Fall back to localStorage if needed
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setUserData(prevData => ({
            ...prevData,
            ...parsedData,
          }));
        } catch (e) {
          console.error("Error parsing stored user data:", e);
        }
      }
    };

    if (userLoaded) {
      loadUserData();
    }
  }, [user, userLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setUserData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const newUserData = { ...userData, profilePicture: reader.result as string };
        setUserData(newUserData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Update local storage
      localStorage.setItem("userData", JSON.stringify(userData));

      // Try to update Clerk profile if possible
      if (user) {
        await user.update({
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          // Note: Updating email would typically require verification
        });
      }

      window.dispatchEvent(new Event("userDataUpdated"));
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Get initial letters for avatar fallback
  const getInitials = () => {
    return (userData.firstName.charAt(0) + userData.lastName.charAt(0)).toUpperCase();
  };

  // Get current date in the required format
  // const currentDate = new Date();
  // const day = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  // const date = currentDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const faqItems = [
    {
      question: "How do I change my password?",
      answer: "Go to the Privacy & Security tab and click on 'Change Password'. Follow the instructions to set a new password."
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "In the Privacy & Security tab, find the 'Two-Factor Authentication' section and toggle the switch to enable it. Follow the setup instructions."
    },
    {
      question: "How can I delete my account?",
      answer: "In the Account tab, scroll to the bottom and find the 'Delete Account' section. Click on 'Delete Account' and follow the confirmation steps."
    },
    {
      question: "How do I update my email address?",
      answer: "In the Account tab, update your email in the 'Contact Information' section and click 'Save Changes'. You may need to verify the new email address."
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header title="Settings"/>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b">
              <h2 className="text-xl md:text-2xl font-semibold">Settings</h2>
              <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b px-4 md:px-6 overflow-x-auto">
                <TabsList className="bg-transparent border-b-0 p-0 flex w-full md:w-auto">
                  <TabsTrigger
                    value="account"
                    className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>

                  <TabsTrigger
                    value="privacy"
                    className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy & Security
                  </TabsTrigger>

                  <TabsTrigger
                    value="notifications"
                    className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>

                  <TabsTrigger
                    value="preferences"
                    className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>

                  <TabsTrigger
                    value="help"
                    className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 md:p-6">
                {/* Status Messages */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {saveSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">Your settings have been saved successfully!</AlertDescription>
                  </Alert>
                )}

                {/* Account Tab Content */}
                <TabsContent value="account" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Picture Section */}
                    <div className="col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profile Picture</CardTitle>
                          <CardDescription>Update your profile image</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                          <Avatar className="w-24 h-24 mb-4">
                            <AvatarImage src={userData.profilePicture} />
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                          </Avatar>
                          <div className="relative">
                            <Button variant="outline" className="flex gap-2">
                              <Camera className="h-4 w-4" />
                              Upload Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Personal Information Section */}
                    <div className="col-span-1 md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Update your basic profile details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input 
                                id="firstName"
                                name="firstName" 
                                value={userData.firstName} 
                                onChange={handleInputChange} 
                                className="mt-1" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input 
                                id="lastName"
                                name="lastName" 
                                value={userData.lastName} 
                                onChange={handleInputChange} 
                                className="mt-1" 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="username" className="flex items-center gap-2">
                              <AtSign className="h-4 w-4" />
                              Username
                            </Label>
                            <Input 
                              id="username"
                              name="username" 
                              value={userData.username} 
                              onChange={handleInputChange} 
                              className="mt-1" 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email" className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address
                            </Label>
                            <Input 
                              id="email"
                              name="email" 
                              type="email"
                              value={userData.email} 
                              onChange={handleInputChange} 
                              className="mt-1" 
                              disabled={!!user} // Disable email field if using Clerk
                            />
                            {user && (
                              <p className="text-xs text-gray-500 mt-1">Email is managed by authentication provider</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea 
                              id="bio"
                              name="bio" 
                              value={userData.bio} 
                              onChange={handleInputChange} 
                              className="mt-1 resize-none" 
                              placeholder="Tell us a little about yourself"
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input 
                                id="location"
                                name="location" 
                                value={userData.location} 
                                onChange={handleInputChange} 
                                className="mt-1" 
                                placeholder="City, Country"
                              />
                            </div>
                            <div>
                              <Label htmlFor="company">Company</Label>
                              <Input 
                                id="company"
                                name="company" 
                                value={userData.company} 
                                onChange={handleInputChange} 
                                className="mt-1" 
                                placeholder="Your organization"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input 
                              id="website"
                              name="website" 
                              value={userData.website} 
                              onChange={handleInputChange} 
                              className="mt-1" 
                              placeholder="https://example.com"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button 
                            onClick={handleSave} 
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Privacy Tab Content */}
                <TabsContent value="privacy" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Switch 
                          checked={userData.twoFactorEnabled}
                          onCheckedChange={(checked) => handleSwitchChange("twoFactorEnabled", checked)}
                        />
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Password</h3>
                        <Button variant="outline" className="flex gap-2">
                          <Lock className="h-4 w-4" />
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Sessions</h3>
                        <p className="text-sm text-gray-500 mb-4">Manage devices where you're currently logged in</p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-gray-500">Chrome on Windows • Active now</p>
                            </div>
                            <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">Current</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                          Sign Out of All Other Sessions
                        </Button>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                        <p className="text-sm text-gray-500 mb-4">Permanent actions that cannot be undone</p>
                        
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab Content */}
                <TabsContent value="notifications" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Configure how and when you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch 
                          checked={userData.emailNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                        />
                      </div>
                      
                      <div className="border-t pt-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Push Notifications</h3>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                        <Switch 
                          checked={userData.pushNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                        />
                      </div>
                      
                      <div className="border-t pt-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Marketing Emails</h3>
                          <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                        </div>
                        <Switch 
                          checked={userData.marketingEmails}
                          onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Preferences"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Preferences Tab Content */}
                <TabsContent value="preferences" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Settings</CardTitle>
                      <CardDescription>Customize your application experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="language" className="text-base mb-1 block">Language</Label>
                        <Select 
                          value={userData.language} 
                          onValueChange={(value) => handleSelectChange("language", value)}
                        >
                          <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Select your language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="border-t pt-6">
                        <Label htmlFor="theme" className="text-base mb-1 block">Theme</Label>
                        <div className="flex space-x-4">
                          <Button 
                            variant={userData.theme === "light" ? "default" : "outline"}
                            className={userData.theme === "light" ? "bg-red-600 hover:bg-red-700" : ""}
                            onClick={() => handleSelectChange("theme", "light")}
                          >
                            Light
                          </Button>
                          <Button 
                            variant={userData.theme === "dark" ? "default" : "outline"}
                            className={userData.theme === "dark" ? "bg-red-600 hover:bg-red-700" : ""}
                            onClick={() => handleSelectChange("theme", "dark")}
                          >
                            Dark
                          </Button>
                          <Button 
                            variant={userData.theme === "system" ? "default" : "outline"}
                            className={userData.theme === "system" ? "bg-red-600 hover:bg-red-700" : ""}
                            onClick={() => handleSelectChange("theme", "system")}
                          >
                            System
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <Label htmlFor="timeZone" className="text-base mb-1 block">Time Zone</Label>
                        <Select 
                          value={userData.timeZone} 
                          onValueChange={(value) => handleSelectChange("timeZone", value)}
                        >
                          <SelectTrigger className="w-full md:w-72">
                            <SelectValue placeholder="Select your time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeZones.map((timeZone) => (
                              <SelectItem key={timeZone.value} value={timeZone.value}>
                                {timeZone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Settings"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Help Tab Content */}
                <TabsContent value="help" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                      <CardDescription>Get answers to common questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {faqItems.map((item) => (
                          <DropdownMenu key={`faq-item-${item.question}`}>
                            <DropdownMenuTrigger>
                              <Button variant="outline" className="w-full justify-between">
                                {item.question}
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full md:min-w-[400px]">
                              <DropdownMenuLabel>Answer</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-default">
                                <p className="py-2">{item.answer}</p>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Support</CardTitle>
                      <CardDescription>Reach out to our team for assistance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="supportSubject">Subject</Label>
                          <Input id="supportSubject" placeholder="Brief description of your issue" />
                        </div>
                        <div>
                          <Label htmlFor="supportMessage">Message</Label>
                          <Textarea 
                            id="supportMessage" 
                            placeholder="Please provide details about your issue or question"
                            rows={5}
                          />
                        </div>
                        <Button className="bg-red-600 hover:bg-red-700">Submit Request</Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Documentation</CardTitle>
                      <CardDescription>Explore our guides and resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                          <h3 className="font-medium mb-1">User Guide</h3>
                          <p className="text-sm text-gray-500">Learn how to use the application</p>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                          <h3 className="font-medium mb-1">API Documentation</h3>
                          <p className="text-sm text-gray-500">Technical reference for developers</p>
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t pt-4">
                      <Button variant="link" className="text-red-600 hover:text-red-800">View All Documentation</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}