import { SORT, ITask } from "./types";

export function cmp(taskA: ITask, taskB: ITask, sortMethod: SORT) {
  if (
    taskA.completionTime !== undefined &&
    taskB.completionTime !== undefined
  ) {
    return taskB.completionTime - taskA.completionTime;
  }
  if (taskA.completionTime !== undefined) return 1;
  if (taskB.completionTime !== undefined) return -1;
  if (sortMethod === "DUE_DATE") {
    return taskA.dueTime - taskB.dueTime;
  } else {
    return taskB.startTime - taskA.startTime;
  }
}
