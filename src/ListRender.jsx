
import { useState, useEffect } from "react";

export default function ListRender({ tasklist, settasklist, deleteTask, handleStatus }) {

    const [selected, setSelected] = useState(0);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowUp" && selected > 0) {
                settasklist((prev) => {
                    const newList = [...prev];
                    [newList[selected - 1], newList[selected]] =
                    [newList[selected], newList[selected - 1]];
                    return newList;
                });
                setSelected((prev) => prev - 1);
            }
            console.log(tasklist.length);
            if (e.key === "ArrowDown" && selected < tasklist.length - 1) {
                settasklist((prev) => {
                    const newList = [...prev];
                    [newList[selected + 1], newList[selected]] =
                    [newList[selected], newList[selected + 1]];
                    return newList;
                });
                setSelected((prev) => prev + 1);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);

    }, [selected, tasklist]);

    const list = tasklist.map((task, index) => (
        <div
            key={task.id || index}
            className={`task-item ${selected === index ? "active" : ""}`}
            onClick={() => setSelected(index)}
        >
            <p className={task.status ? "completed" : ""}>
                {task.name}
            </p>

            <button onClick={() => handleStatus(index)}>
                {task.status ? "Done" : "Pending"}
            </button>

            <button onClick={() => deleteTask(index)}>
                Delete
            </button>
        </div>
    ));

    return <div className="Task-List">{list}</div>;
}