export default function InputRender({ task, handleChange, addTask }){
    return(
        <>
        <h1>Todo App</h1>
        <div className="inputTaskDiv">
            <div className="input-Box">
                <input className="input-task" required type="text"
                        placeholder=" " onChange={handleChange} value={task.name} />
                <label className="inputLabel">Task</label>
            </div>
            <button className="Add-Task" onClick={addTask}>Add-Task</button>
        </div>
        </>       
    );
}