import { useState, useEffect } from "react";
import TaskRender from "../helpingComponent/TodoManager.jsx";

export default function LongTermTask(){
    
    const [LongTask, setLongTask] = useState(() => {
        const saved = localStorage.getItem("LongGoals");
        return saved ? JSON.parse(saved) : [];
    });


    useEffect(() => {
        localStorage.setItem("LongGoals", JSON.stringify(LongTask));
    }, [LongTask]);

    return(
        <div className="container">
            <div className="main-section">
                <TaskRender taskList={LongTask} setTaskList={setLongTask} />
            </div>
        </div>
    );
}