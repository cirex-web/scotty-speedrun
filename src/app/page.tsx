"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { BsTrash3 } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { useLocalStorage } from "react-use";
import { getGreenRedColor } from "./color";

function getTimeString(durationMs: number) {
  const ms = durationMs % 1000;
  durationMs = Math.floor(durationMs / 1000);
  const seconds = durationMs % 60;
  durationMs = Math.floor(durationMs / 60);
  const minutes = durationMs % 60;
  durationMs = Math.floor(durationMs / 60);
  const hours = durationMs % 24;
  durationMs = Math.floor(durationMs / 24);
  const days = durationMs;

  const timeWithoutDays = (
    <>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
      <span style={{ color: "gray" }}>:{String(ms).padStart(3, "0")}</span>
    </>
  );
  if (days === 0) {
    return timeWithoutDays;
  }
  return (
    <>
      {String(days)}:{timeWithoutDays}
    </>
  );
}
interface ITask {
  title: string;
  startTime: number;
  dueTime: number;
  completionTime: number | undefined;
  id: number;
}
interface ICompletedTask extends ITask {
  completionTime: number;
}
const originalTasks = [
  {
    title: "some task",
    startTime: +new Date(),
    dueTime: 1000 * 30 + +new Date(),
    completionTime: undefined,
    id: 1,
  },
  {
    title: "completed task",
    startTime: +new Date() - 1000 * 60,
    dueTime: 1000 * 30 + +new Date(),
    completionTime: +new Date(),
    id: 2,
  },
  {
    title: "completed task",
    startTime: +new Date() - 1000 * 60,
    dueTime: 1000 * 30 + +new Date(),
    completionTime: +new Date(),
    id: 3,
  },
  {
    title: "completed task",
    startTime: +new Date() - 1000 * 60,
    dueTime: 1000 * 30 + +new Date(),
    completionTime: +new Date(),
    id: 4,
  },
  {
    title: "some task",
    startTime: +new Date(),
    dueTime: 1000 * 30 + +new Date(),
    completionTime: undefined,
    id: 5,
  },
];
function timestampToDatetimeInputString(timestampMs: number) {
  const date = new Date(timestampMs);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toJSON().slice(0, -8);
}
function TaskRow({
  task,
  toggleTask,
  deleteTask,
  editTask,
}: {
  task: ITask;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  editTask: (id: number) => void;
}) {
  const [rerender, setRerender] = useState(0);
  const COLOR_RANGE_TIME_MS = 1000 * 60 * 60 * 24 * 5;
  useEffect(() => {
    setInterval(() => setRerender((render) => render + 1), 13);
  }, []);
  const timeTakenMs =
    task.completionTime !== undefined
      ? task.completionTime - task.startTime
      : +new Date() - task.startTime;
  return (
    <li key={task.id} className={styles.taskList__row}>
      <input
        type="checkbox"
        id={`${task.id}`}
        checked={task.completionTime !== undefined}
        onChange={() => toggleTask(task.id)}
      />
      <label htmlFor={`${task.id}`}>
        <h3>{task.title}</h3>
      </label>
      <p>
        (Due{" "}
        {new Date(task.dueTime).toLocaleDateString() +
          " " +
          new Date(task.dueTime).toLocaleTimeString()}
        )
      </p>
      <button className={styles.taskList__row__inlineButton}>
        <BsTrash3 onClick={() => deleteTask(task.id)} />
      </button>
      <button className={styles.taskList__row__inlineButton}>
        <FiEdit2 onClick={() => editTask(task.id)} />
      </button>
      <p
        className={styles.taskList__row__completionTime}
        style={{
          color: getGreenRedColor(
            Math.max(0, 1 - timeTakenMs / COLOR_RANGE_TIME_MS)
          ),
        }}
      >
        {getTimeString(timeTakenMs)}
      </p>
    </li>
  );
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useLocalStorage<ITask[]>("tasks", []);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const formRef = useRef<HTMLFormElement>(null);
  const [taskIdBeingEdited, setTaskIdBeingEdited] = useState<number>();
  if (!isClient || tasks === undefined) return;

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
  const editTask = (taskId: number) => {
    if (!formRef.current) return;
    console.log(formRef.current);
    const task = tasks.find((task) => task.id === taskId);
    if (!task) {
      console.error("Failed to find task!");
      return;
    }
    formRef.current.taskName.value = task.title;
    formRef.current.startDate.value = timestampToDatetimeInputString(
      task.startTime
    );
    formRef.current.dueDate.value = timestampToDatetimeInputString(
      task.dueTime
    );
    setTaskIdBeingEdited(task.id);
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
    setTaskIdBeingEdited(undefined);
  };
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };
  return (
    <div className={styles.card}>
      <div className={styles.card__leftCol}>
        <Image
          className={styles.leftCol__logo}
          src="/logo.png"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className={styles.taskList}>
          {
            <p className={styles.taskList__edit_form_header}>
              {taskIdBeingEdited !== undefined
                ? "Editing task"
                : "Make a new task! (name/start date/due date)"}
            </p>
          }
          <form
            onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              e.preventDefault();
              const taskName = formData.get("taskName");
              const startDate = new Date(formData.get("startDate") as string);
              const dueDate = new Date(formData.get("dueDate") as string);
              if (
                typeof taskName !== "string" ||
                taskName === "" ||
                isNaN(startDate.getTime()) ||
                isNaN(dueDate.getTime())
              )
                return;
              (e.target as HTMLFormElement).reset();
              if (taskIdBeingEdited !== undefined) {
                updateTask(taskIdBeingEdited, taskName, startDate, dueDate);
              } else {
                addNewTask(taskName, startDate, dueDate);
              }
            }}
            className={styles.newTaskRow}
            ref={formRef}
          >
            <input placeholder="New Task" name="taskName" required />
            <input type="datetime-local" name="startDate" />
            <input type="datetime-local" name="dueDate" />
            <button>+</button>
          </form>
          {!tasks.length && <p>No tasks yet! Add one above</p>}
          {tasks
            .sort((taskA, taskB) => {
              if (
                taskB.completionTime !== undefined &&
                taskA.completionTime !== undefined
              )
                return taskB.completionTime - taskA.completionTime;
              if (taskA.completionTime !== undefined) return 1;
              if (taskB.completionTime !== undefined) return -1;
              return taskB.startTime - taskA.startTime;
            })
            .map(
              (task) =>
                task.id !== taskIdBeingEdited && (
                  <TaskRow
                    key={task.id}
                    task={task}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    editTask={editTask}
                  />
                )
            )}
        </ol>
      </div>

      <div className={styles.card__rightCol}>
        <h2>Best Times</h2>
        <ol className={styles.bestTimesList}>
          {tasks
            .filter(
              (task): task is ICompletedTask =>
                task.completionTime !== undefined
            )
            .sort((taskA, taskB) => {
              return (
                taskA.completionTime -
                taskA.startTime -
                (taskB.completionTime - taskB.startTime)
              );
            })
            .map((task) => {
              return (
                <li key={task.id}>
                  {getTimeString(task.completionTime - task.startTime)}
                  {" / " + task.title}
                </li>
              );
            })}
        </ol>
      </div>
      {/* <footer className={styles.footer}>Made by cirex</footer> */}
    </div>
  );
}
