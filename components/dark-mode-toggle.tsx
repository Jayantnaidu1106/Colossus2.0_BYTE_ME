"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

// Create a global variable to store the dark mode state
let globalIsDarkMode = false;

// Create a list of callbacks to be called when the dark mode changes
const darkModeChangeCallbacks: ((isDarkMode: boolean) => void)[] = [];

// Function to register a callback
export function registerDarkModeChangeCallback(callback: (isDarkMode: boolean) => void) {
  darkModeChangeCallbacks.push(callback);
  // Call the callback immediately with the current state
  callback(globalIsDarkMode);
  // Return a function to unregister the callback
  return () => {
    const index = darkModeChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      darkModeChangeCallbacks.splice(index, 1);
    }
  };
}

// Function to notify all callbacks of a change
function notifyDarkModeChange(isDarkMode: boolean) {
  globalIsDarkMode = isDarkMode;
  darkModeChangeCallbacks.forEach(callback => callback(isDarkMode));
}

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(globalIsDarkMode);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode !== null) {
      const parsedDarkMode = storedDarkMode === "true";
      setIsDarkMode(parsedDarkMode);
      notifyDarkModeChange(parsedDarkMode);
    }
  }, []);

  // Update localStorage and notify when dark mode changes
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
    notifyDarkModeChange(isDarkMode);
    
    // Apply dark mode to the document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
