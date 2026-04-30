import { useState, useEffect} from "react";
import InputRender from "./inputRenders.jsx";
import ListRender from "./listRender.jsx";
function App(){

    const [taskList, setTaskList] = useState(() => {
        const saved = localStorage.getItem("tasks");
        return saved ? JSON.parse(saved) : [];
    });
    const [task, setTask] = useState({ name: '', status: false });
    
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }, [taskList]);
    
    function handleChange(e){
        setTask((t) => ({...t, name: e.target.value}));
    }
    
    function addTask() {
        if(task.name.trim() === '') return;
        setTaskList((prev) => [...prev, task]);
        setTask({name: "", status: false});
    }

    function handleStatus(index){
        setTaskList((prev) => 
            prev.map((task, i) => 
                i === index ? {...task, status: !task.status} : task
            )
        );
    }
    function deleteTask(index){
        setTaskList((prev) => prev.filter((_, i) => i !== index));
    }

    return(
        <>
            <InputRender task={task} handleChange={handleChange} addTask={addTask} />
            <ListRender tasklist={taskList} deleteTask={deleteTask} handleStatus={handleStatus} />
        </>
    );
}

export default App