export interface ITask {
  title: string;
  startTime: number;
  dueTime: number;
  completionTime: number | undefined;
  id: number;
}
export type SORT = "DUE_DATE" | "START_DATE";
export interface ICompletedTask extends ITask {
  completionTime: number;
}
