import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import Generator from "./components/Generator";
import History from "./components/History";
import Pricing from "./components/Pricing";
import Landing from "./components/Landing";

export default function App() {
  const [page, setPage] = useState("generate");

  return (
    <>
      <SignedOut>
        <Landing />
      </SignedOut>
      <SignedIn>
        <div className="app-shell">
          <nav className="navbar">
            <div className="nav-brand">
            <img src="/logo.svg" alt="Dablin" height="48" />
            </div>
            <div className="nav-links">
              <button
                className={`nav-link ${page === "generate" ? "active" : ""}`}
                onClick={() => setPage("generate")}
              >Generate</button>
              <button
                className={`nav-link ${page === "history" ? "active" : ""}`}
                onClick={() => setPage("history")}
              >History</button>
              <button
                className={`nav-link ${page === "pricing" ? "active" : ""}`}
                onClick={() => setPage("pricing")}
              >Credits</button>
            </div>
            <UserButton afterSignOutUrl="/" />
          </nav>
          <main className="main-content">
            {page === "generate" && <Generator />}
            {page === "history"  && <History />}
            {page === "pricing"  && <Pricing setPage={setPage} />}
          </main>
        </div>
      </SignedIn>
    </>
  );
}
