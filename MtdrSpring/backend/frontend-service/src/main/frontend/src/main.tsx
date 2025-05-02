///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/main.tsx
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react-router";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/login"
      signUpUrl="/"
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>,
);
