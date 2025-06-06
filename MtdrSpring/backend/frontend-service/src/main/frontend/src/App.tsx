///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/App.tsx
import { Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/react-router";
import Dashboard from "./components/pages/home/Dashboard";
import Register from "./components/pages/register/Register";
import Login from "./components/pages/login/Login";
import Settings from "./components/pages/home/Settings";
import CalendarPage from "./components/pages/home/Calendar";
import Sprints from "./components/pages/home/Sprints";
import SSOCallback from "./components/SSOCallback"; // Import the SSOCallback component
import Choosepath from "./components/pages/choosepath/Choosepath";
import { ProjectProvider } from "./context/ProjectContext";

function App() {
  return (
    <ProjectProvider>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/choosepath" element={<Choosepath />} />
          {/* Callback Route */}
          <Route path="/sso-callback" element={<SSOCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <SignedIn>
                  <Settings />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/sprints"
            element={
              <>
                <SignedIn>
                  <Sprints />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/calendar"
            element={
              <>
                <SignedIn>
                  <CalendarPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Register />} />
        </Routes>
      </div>
    </ProjectProvider>
  );
}

export default App;
