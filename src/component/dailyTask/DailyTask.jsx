import { useState, useEffect } from "react";
import TaskRender from "../helpingComponent/TodoManager.jsx";
import Timer from "../helpingComponent/CountDown.jsx";
import "./DailyTask.css";

export default function DailyTask(){
    const [TodayTask, setTodayTask] = useState(() => {
        const saved = localStorage.getItem("dayTask");
        return saved ? JSON.parse(saved) : [];
    });

    const getNextMidnight = () => {
       const d = new Date();
        d.setHours(24, 0, 0, 0);
        return d;
    };

    useEffect(() => {
        localStorage.setItem("dayTask", JSON.stringify(TodayTask));
    }, [TodayTask]);

    function taskReset(){
        setTodayTask((prev) =>
            prev.map((task) => ({...task, status: false}))
        )    
    }

    useEffect(() => {
        const interval =setInterval(() => {
            
            const todayDate = new Date().toDateString();
            const lastDate = localStorage.getItem("lastDate");
            
            if(todayDate !== lastDate){
                taskReset();
                localStorage.setItem("lastDate", todayDate);
            }
        }, 3600000);
        return () => clearInterval(interval);
    }, [])
    return(
        <div className="container">
            <Timer Till={getNextMidnight()} />
            <div className="main-section">
                <TaskRender taskList={TodayTask} setTaskList={setTodayTask} />
            </div>
        </div>
    );
}