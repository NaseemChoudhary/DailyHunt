import { useState, useEffect } from "react";
import DailyTask from "./component/dailyTask/DailyTask.jsx";
import LongTermTask from "./component/LongTermTask/LongTermTask.jsx";
import "./component/ThemeToggle.css";

export default function App(){
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return(
        <>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <DailyTask />
            <LongTermTask />
        </>
    );
}