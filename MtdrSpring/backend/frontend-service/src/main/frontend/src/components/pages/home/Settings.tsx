///Users/santosa/Documents/GitHub/oraclefront/src/components/pages/home/Settings.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { User, Shield, HelpCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useUser } from "@clerk/react-router";

export default function Settings() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePicture: "",
  });

  useEffect(() => {
    const loadUserData = () => {
      // Try to get data from Clerk first
      if (user) {
        setUserData({
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          username: user.username ?? "",
          email: user.emailAddresses[0]?.emailAddress ?? "",
          profilePicture: user.imageUrl ?? "",
        });
        return;
      }

      // Fall back to localStorage if needed
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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

  const handleSave = async () => {
    // Update local storage
    localStorage.setItem("userData", JSON.stringify(userData));

    // Try to update Clerk profile if possible
    if (user) {
      try {
        await user.update({
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          // Note: Updating email would typically require verification
        });
      } catch (error) {
        console.error("Error updating user profile:", error);
      }
    }

    window.dispatchEvent(new Event("userDataUpdated"));
    alert("Profile updated!");
  };

  // Get current date in the required format
  const currentDate = new Date();
  const day = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const date = currentDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header day={day} date={date} title="To" titleSpan="Do" />

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

            <Tabs defaultValue="account" className="w-full">
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
                    value="help"
                    className="rounded-none border-b-2 border-transparent px-3 md:px-4 py-3 data-[state=active]:border-[#ff6767] data-[state=active]:text-[#ff6767] data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 md:p-6">
                {/* Account Tab Content */}
                <TabsContent value="account" className="mt-0 space-y-6">
                  {/* Profile Picture */}
                  <div>
                    <img
                      src={userData.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                  </div>

                  {/* Personal Information */}
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input name="firstName" value={userData.firstName} onChange={handleInputChange} />
                  </div>

                  {/* Save Button */}
                  <Button onClick={handleSave}>Save Changes</Button>
                </TabsContent>

                {/* Privacy Tab Content */}
                <TabsContent value="privacy" className="mt-0">
                  Privacy settings content
                </TabsContent>

                {/* Help Tab Content */}
                <TabsContent value="help" className="mt-0">
                  Help and support content
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}