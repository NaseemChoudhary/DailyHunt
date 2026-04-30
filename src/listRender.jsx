export default function listRender({tasklist, deleteTask, handleStatus}){

    const list = tasklist.map((task, index) => 
        <div key={index} className="task-item">
            <p className={task.status ? "completed" : ""}>{task.name}</p>
            <button className="Status" onClick={() => handleStatus(index)}>{task.status?"Done":"Pending"}</button>
            <button className="Delete" onClick={() => deleteTask(index)}>Delete</button>
        </div>
    )
    return(
        <>
        <div className="Task-List">
            {list}                      
        </div>
        </>
    );
}