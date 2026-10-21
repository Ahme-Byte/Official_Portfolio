import { useEffect, useState } from "react";

export function getThemeMode() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setThemeMode(mode) {
  document.documentElement.dataset.theme = mode;
  try {
    window.localStorage.setItem("portfolio-theme", mode);
  } catch (error) {
    console.warn("Unable to persist the selected portfolio theme.", error);
  }
  window.dispatchEvent(new CustomEvent("portfolio-theme-change", { detail: mode }));
}

export function useThemeMode() {
  const [mode, setMode] = useState(() => getThemeMode());

  useEffect(() => {
    const handleChange = (event) => setMode(event.detail);
    window.addEventListener("portfolio-theme-change", handleChange);
    return () => window.removeEventListener("portfolio-theme-change", handleChange);
  }, []);

  return mode;
}
