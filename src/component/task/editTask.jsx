import "./editTask.css"
import { useContext, useState } from "react";
import { TaskFunContext } from "../../context/taskFunContext";


export default function TaskEditter ( {id, setIsEditing} ){
    const { taskList, setTaskList} = 
        useContext(TaskFunContext);

    const selectedTask = taskList.find(task => task.id === id)?taskList.find(task => task.id === id):"";
    
    const [task, setTask] = useState(selectedTask);
    
    function handleChange(key, e){
        setTask((prev) => ({...prev, [key]: e.target.value}))
    }

    function save(){
        setTaskList(prev => 
            prev.map(t => t.id === task.id? task: t )
        );

        setIsEditing(false)
    }

    return(
        <>
                <input className="input-task" onChange={(e) => {handleChange("name", e)}} value={task?.name || ""}/>
                <textarea className="input-task" onChange={(e) => {handleChange("note", e)}} value={task.note?task.note:""}>{task.note?task.note:""}</textarea>
                <button className="Add-Task">Set Timer</button>
                <button className="Add-Task" onClick={save}>Confirm</button>
        </>
        
    );
}