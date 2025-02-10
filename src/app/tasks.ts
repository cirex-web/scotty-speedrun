import { useLocalStorage } from "react-use";
import { ITask } from "./types";

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<ITask[]>("tasks", []);
  if (tasks === undefined) {
    return {};
  }
  const addNewTask = (taskName: string, startDate: Date, dueDate: Date) => {
    setTasks([
      ...tasks,
      {
        title: taskName,
        startTime: +startDate,
        dueTime: +dueDate,
        id: Date.now() * 100 + Math.floor(Math.random() * 100),
        completionTime: undefined,
      },
    ]);
  };
  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completionTime:
              task.completionTime === undefined ? +new Date() : undefined,
          };
        }
        return task;
      })
    );
  };

  const updateTask = (
    taskId: number,
    taskName: string,
    startDate: Date,
    dueDate: Date
  ) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          title: taskName,
          startTime: +startDate,
          dueTime: +dueDate,
        };
      })
    );
  };
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };
  return { tasks, updateTask, deleteTask, toggleTask, addNewTask };
}
