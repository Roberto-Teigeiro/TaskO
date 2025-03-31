import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/pages/home/Dashboard';
import Register from './components/pages/register/Register';
import Login from './components/pages/login/Login';
import Settings from "./components/pages/home/Settings";
import CalendarPage from './components/pages/home/Calendar';
import Sprints from './components/pages/home/Sprints';
import { ChatButton } from './components/ChatBot';


function App() {
  return (
    <div>
    <Routes>
      {/* Initial Route (Register Page) */}
      <Route path="/" element={<Register />} />

      {/* Dashboard Route */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Register />} />
      <Route path = "/settings" element = {<Settings />} />
      <Route path = "/sprints" element = {<Sprints />} />
      <Route path = "/calendar" element = {<CalendarPage />} />
      
      

    </Routes>
    <ChatButton />
    </div>
    
    
  );
}

export default App;
