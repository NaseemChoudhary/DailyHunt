import { useState } from "react";
import InputRender from "../input/InputRenders.jsx";
import ListRender from "../task/ListRender.jsx";
import "./TodoManager.css";
function TaskRender({taskList, setTaskList}){

    function handleChange(e){
        setTask((t) => ({...t, name: e.target.value}));
    }
    const [newTask, setTask] = useState({ id: Date.now() ,name: '', status: false });

    function addTask() {
        if(newTask.name.trim() === '') return;
        setTaskList((prev) => [...prev, newTask]);
        setTask({ id: Date.now(), name: "", status: false});
    }

    function handleStatus(id){
        setTaskList((prev) => 
            prev.map((newTask) => 
                newTask.id === id ? {...newTask, status: !newTask.status} : newTask
            )
        );
    }
    function deleteTask(id){
        setTaskList((prev) => prev.filter((task) => task.id !== id));
    }

    return(
        <div className="task-manager">
            <InputRender task={newTask} handleChange={handleChange} addTask={addTask} />
            <ListRender taskList={taskList} deleteTask={deleteTask} handleStatus={handleStatus} setTaskList={setTaskList}/>
        </div>
    );
}

export default TaskRender