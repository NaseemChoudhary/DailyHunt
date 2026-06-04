import { useState, useEffect, useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import DailyTask from "./component/DifferentPage/DailyTask.jsx";
import LongTermTask from "./component/DifferentPage/LongTermTask.jsx";
import {ThemeContext} from "./context/theme.jsx"

export default function App() {

  const { theme, toggleTheme } = useContext(ThemeContext);
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme])
  
  return (
    <>
      <nav>
        <Link to="/">
          <p className="navLink">Daily Task</p>
        </Link>
        <Link to="/longTerm">
          <p className="navLink">Long Term Tasks</p>
        </Link>
        <button
          className="theme-toggle" onClick={toggleTheme}
          title="Toggle theme"> {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </nav>
      <Routes>
        <Route path="/" element={<DailyTask />} />
        <Route path="/longTerm" element={<LongTermTask />} />
      </Routes>
    </>
  );
}
