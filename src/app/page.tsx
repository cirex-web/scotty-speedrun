"use client";
import Image from "next/image";
import styles from "./page.module.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsTrash3 } from "react-icons/bs";
import { FiEdit2 } from "react-icons/fi";
import { useLocalStorage } from "react-use";
import { getGreenRedColor } from "./color";
import { getTimeString, timestampToDatetimeInputString } from "./time";
import { ITask, SORT, ICompletedTask } from "./types";
import { useTasks } from "./tasks";
import { cmp } from "./sort";
function LiveTimeString({
  timeTakenMs,
  ...props
}: { timeTakenMs: number } & React.ComponentPropsWithRef<"p">) {
  const COLOR_RANGE_TIME_MS = 1000 * 60 * 60 * 24 * 5;

  return (
    <p
      style={{
        color: getGreenRedColor(
          Math.max(0, 1 - timeTakenMs / COLOR_RANGE_TIME_MS)
        ),
      }}
      {...props}
    >
      {getTimeString(timeTakenMs)}
    </p>
  );
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
  const [, setRerender] = useState(0);

  const timeTakenMs =
    task.completionTime !== undefined
      ? task.completionTime - task.startTime
      : +new Date() - task.startTime;
  useEffect(() => {
    if (task.completionTime === undefined) {
      const intervalId = setInterval(
        () => setRerender((render) => render + 1),
        13
      );
      return () => clearInterval(intervalId);
    }
  }, [task.completionTime]);
  const shouldDisplayCheckbox = timeTakenMs >= 0;
  return (
    <li key={task.id} className={styles.taskList__row}>
      {useMemo(
        () => (
          <input
            type="checkbox"
            id={`${task.id}`}
            checked={task.completionTime !== undefined}
            onChange={() => toggleTask(task.id)}
            disabled={!shouldDisplayCheckbox}
            className={styles.taskList__row__checkbox}
          />
        ),
        [shouldDisplayCheckbox, task, toggleTask]
      )}
      <label htmlFor={`${task.id}`} className={styles.taskList__row__taskName}>
        <h3
          style={{ fontWeight: task.completionTime === undefined ? "" : "400" }}
        >
          {task.title}
        </h3>
      </label>
      <p className={styles.taskList__row__dueDate}>
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

      <LiveTimeString
        timeTakenMs={timeTakenMs}
        className={styles.taskList__row__completionTime}
      />
    </li>
  );
}
function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}
export default function Home() {
  const isClient = useIsClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [sortOrder, setSortOrder] = useLocalStorage<SORT>(
    "sortOrder",
    "START_DATE"
  );
  const [hideCompletedTasks, setHideCompletedTasks] = useLocalStorage<boolean>(
    "hideCompletedTasks",
    false
  );
  const [taskIdBeingEdited, setTaskIdBeingEdited] = useState<number>();
  const { tasks, addNewTask, updateTask, toggleTask, deleteTask } = useTasks();
  if (
    !isClient ||
    tasks === undefined ||
    sortOrder === undefined ||
    hideCompletedTasks === undefined
  )
    return;

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

  return (
    <div className={styles.card}>
      <div className={styles.card__leftCol}>
        <div className={styles.leftCol__logoContainer}>
          <Image
            className={styles.leftCol__logo}
            src="/logo2.png"
            alt="Scotty Speedrun logo"
            width={1000}
            height={0}
            priority
          />
        </div>

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
                setTaskIdBeingEdited(undefined);
              } else {
                addNewTask(taskName, startDate, dueDate);
              }
            }}
            className={styles.taskList__newTaskRow}
            ref={formRef}
          >
            <input placeholder="New Task" name="taskName" required />
            <input type="datetime-local" name="startDate" />
            <input type="datetime-local" name="dueDate" />
            <button>+</button>
          </form>
          <div className={styles.taskList__settings_container}>
            <div className={styles.settings_container__left}>
              <input
                type="checkbox"
                checked={hideCompletedTasks}
                onChange={(e) => setHideCompletedTasks(e.target.checked)}
                id="showHiddenTasks"
              />
              <label htmlFor="showHiddenTasks">
                <span> Hide completed tasks</span>
              </label>
            </div>

            <div>
              <label htmlFor="sort">Sort by: </label>
              <select
                name="sort"
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SORT)}
              >
                <option value="DUE_DATE">Due date</option>
                <option value="START_DATE">Time elapsed</option>
              </select>
            </div>
          </div>
          {!tasks.length && <p>No tasks yet! Add one above</p>}

          {tasks
            .filter(
              (task) => !hideCompletedTasks || task.completionTime === undefined
            )
            .sort((a, b) => cmp(a, b, sortOrder))
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
      <footer className={styles.footer}>
        Made by{" "}
        <a href="https://github.com/cirex-web/scotty-speedrun" target="_blank">
          cirex
        </a>
        . Logo shamelessly stolen from ScottyCon without permission
      </footer>
    </div>
  );
}
