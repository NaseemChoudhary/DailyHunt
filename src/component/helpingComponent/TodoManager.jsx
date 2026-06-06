import { useState, useEffect } from "react";
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

  const sortTasks = (tasks) =>
    [...tasks].sort((a, b) => Number(a.status) - Number(b.status));

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
      const timerId = setInterval(() => {
        setNow(Date.now());
      }, 1000);

      return () => clearInterval(timerId);
    }, []);
  function handleChange(key, e) {
    setTask((t) => ({ ...t, [key]: e.target.value }));
  }

  function addTask() {
    if (newTask.name.trim() === "") return;
    setTaskList((prev) => sortTasks([...prev, newTask]));
    setTask({ id: Date.now(), name: "", status: false });
  }

  function handleStatus(id) {
    setTaskList((prev) =>
      sortTasks(
        prev.map((newTask) =>
          newTask.id === id ? { ...newTask, status: !newTask.status } : newTask,
        ),
      ),
    );
  }

  useEffect(() => {
    const sorted = sortTasks(taskList);
    const isSorted = taskList.every((task, index) => task.status === sorted[index]?.status);
    if (!isSorted) {
      setTaskList(sorted);
    }
  }, [taskList, setTaskList]);

  function deleteTask(id) {
    setTaskList((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <TaskFunContext.Provider
      value={{
        taskList,
        setTaskList,
          now,
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
