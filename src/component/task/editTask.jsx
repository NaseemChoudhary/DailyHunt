import "./editTask.css";
import { useContext, useState } from "react";
import { TaskFunContext } from "../../context/taskFunContext";

export default function TaskEditter({ id, setIsEditing }) {
  const { taskList, setTaskList } = useContext(TaskFunContext);

  const selectedTask = taskList.find((task) => task.id === id)
    ? taskList.find((task) => task.id === id)
    : "";
  const [isST, setST] = useState(false); // used to check is Set timer button is clicked or not
  const [task, setTask] = useState(selectedTask);
  const timerDate = task.timer ? new Date(task.timer) : new Date();

  const [date, setDate] = useState(timerDate.toISOString().split("T")[0]);

  const [time, setTime] = useState(timerDate.toTimeString().slice(0, 5));

  function handleChange(key, e) {
    setTask((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function save() {
    setTaskList((prev) => prev.map((t) => (t.id === task.id ? task : t)));

    setIsEditing(false);
  }

  function changeTimer() {
    const timer = new Date(`${date}T${time}`);
   {console.log(task.timer)}
   {console.log(timer)}
    handleChange("timer", {
      target: {
        value: timer.toISOString(),
      },
    });
    setST(false);
  }

  return (
    <>
      <input
        className="input-task"
        onChange={(e) => {
          handleChange("name", e);
        }}
        value={task?.name || ""}
      />
      <textarea
        className="input-task"
        onChange={(e) => {
          handleChange("note", e);
        }}
        value={task.note ? task.note : ""}
      >
        {task.note ? task.note : ""}
      </textarea>
      <button className="Add-Task" onClick={() => setST(true)}>
        Set Timer
      </button>
      <button className="Add-Task" onClick={save}>
        Confirm
      </button>
      {isST && (
        <div className="setTimer">
          <div className="panel">
            <button className="close-btn" onClick={() => setST(false)} aria-label="Close">×</button>
            <h3>⏱ Set Timer</h3>
            <div className="row">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="controls">
              <button className="Add-Task" onClick={changeTimer}>
                Confirm
              </button>
              <button
                className="Add-Task delete"
                onClick={() => {
                  handleChange("timer", { target: { value: "" } });
                  setST(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
