///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/home/Settings.tsx
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { User, Shield, HelpCircle, Save } from "lucide-react"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"

export default function Settings() {
  //const [activeTab, setActiveTab] = useState("account")
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePicture: "",
  });

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const newUserData = { ...userData, profilePicture: reader.result as string };
        setUserData(newUserData);
        localStorage.setItem("userData", JSON.stringify(newUserData));
        window.dispatchEvent(new Event("userDataUpdated"));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    localStorage.setItem("userData", JSON.stringify(userData));
    window.dispatchEvent(new Event("userDataUpdated"));
    alert("Profile updated!");
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header day="Tuesday" date="20/06/2023" title = "To" titleSpan = "Do"/>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
         
        />
      

      {/* Main Content */}
      
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b">
              <h2 className="text-xl md:text-2xl font-semibold">Settings</h2>
              <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="account" className="w-full" >
              <div className="border-b px-4 md:px-6 overflow-x-auto">
                <TabsList className="bg-transparent border-b-0 p-0 flex w-full md:w-auto">
                  <TabsTrigger
                    value="account"
                    className={`rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Account</span>
                    <span className="md:hidden">Account</span>
                  </TabsTrigger>
                 
                  
                  <TabsTrigger
                    value="privacy"
                    className={`rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Privacy & Security</span>
                    <span className="md:hidden">Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="help"
                    className={`rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap`}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Help & Support</span>
                    <span className="md:hidden">Help</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 md:p-6">
                <TabsContent value="account" className="mt-0 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={userData.profilePicture || "/placeholder.svg?height=150&width=150"}
                          alt="Profile"
                          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#ff6767]"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profile-picture"
                        />
                        <label
                          htmlFor="profile-picture"
                          className="absolute bottom-0 right-0 rounded-full bg-[#ff6767] hover:bg-[#ff5252] text-white px-3 py-1 cursor-pointer text-sm"
                        >
                          Change
                        </label>
                      </div>
                      <h3 className="mt-4 font-semibold text-lg">{userData.firstName} {userData.lastName}</h3>
                      <p className="text-gray-500 text-sm">{userData.email}</p>
                    </div>

                    <div className="md:w-2/3 space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          name="email"
                          type="email" 
                          value={userData.email}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          name="username"
                          value={userData.username}
                          onChange={handleInputChange}
                        />
                      </div>

                      <h3 className="font-semibold text-lg border-b pb-2 mt-6">Password</h3>

                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input name="currentPassword" type="password" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input name="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input name="confirmPassword" type="password" />
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button 
                          className="bg-[#ff6767] hover:bg-[#ff5252]"
                          onClick={handleSave}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <p>Privacy settings content</p>
                </TabsContent>

                <TabsContent value="help" className="mt-0">
                  <p>Help and support content</p>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    
  )
}


