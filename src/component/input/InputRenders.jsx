import { useContext } from "react";
import { TaskFunContext } from "../../context/taskFunContext";
import "./InputRenders.css";

export default function InputRender(){
    
    const { newTask, handleChange, addTask } = useContext(TaskFunContext);

    return(
        <form>
        <h1>Todo App</h1>
        <div className="inputTaskDiv">
            <div className="input-Box">
                <input className="input-task" required type="text"
                        placeholder=" " onChange={(e) => {handleChange("name", e)}} value={newTask.name} />
                <label className="inputLabel">Task</label>
            </div>
            <button className="Add-Task" onClick={addTask}>Add-Task</button>
        </div>
        </form>       
    );
}