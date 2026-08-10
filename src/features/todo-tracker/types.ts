
export interface Todo {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface ToDoTrackerInitialData {
  [key: string]: any;
  todos?: Todo[];
}
