import { useState } from "react";
import InputRender from "./InputRenders.jsx";
import ListRender from "./ListRender.jsx";
function TaskRender({taskList, setTaskList}){

    function handleChange(e){
        setTask((t) => ({...t, name: e.target.value}));
    }
    const [newTask, setTask] = useState({ name: '', status: false });

    function addTask() {
        if(newTask.name.trim() === '') return;
        setTaskList((prev) => [...prev, newTask]);
        setTask({name: "", status: false});
    }

    function handleStatus(index){
        setTaskList((prev) => 
            prev.map((newTask, i) => 
                i === index ? {...newTask, status: !newTask.status} : newTask
            )
        );
    }
    function deleteTask(index){
        setTaskList((prev) => prev.filter((_, i) => i !== index));
    }

    return(
        <>
            <InputRender task={newTask} handleChange={handleChange} addTask={addTask} />
            <ListRender tasklist={taskList} deleteTask={deleteTask} handleStatus={handleStatus} settasklist={setTaskList}/>
        </>
    );
}

export default TaskRender