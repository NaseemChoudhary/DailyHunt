import { useState } from "react";
import { TaskFunContext } from "./../../context/taskFunContext.js";
import InputRender from "../input/InputRenders.jsx";
import ListRender from "../task/ListRender.jsx";
import "./TodoManager.css";

function TaskRender({ taskList, setTaskList }) {
  const [newTask, setTask] = useState({
    id: Date.now(),
    name: "",
    status: false,
    note: "",
    timer: "",
  });

  function handleChange(key, e) {
    setTask((t) => ({ ...t, [key]: e.target.value }));
  }

  function addTask() {
    if (newTask.name.trim() === "") return;
    setTaskList((prev) => [...prev, newTask]);
    setTask({ id: Date.now(), name: "", status: false });
  }

  function handleStatus(id) {
    setTaskList((prev) =>
      prev.map((newTask) =>
        newTask.id === id ? { ...newTask, status: !newTask.status } : newTask,
      ),
    );
  }

  function deleteTask(id) {
    setTaskList((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <TaskFunContext.Provider
      value={{
        taskList,
        setTaskList,
        newTask,
        handleChange,
        addTask,
        handleStatus,
        deleteTask,
        setTask,
      }}
    >
      <div className="task-manager">
        <InputRender />
        <ListRender />
      </div>
    </TaskFunContext.Provider>
  );
}

export default TaskRender;
