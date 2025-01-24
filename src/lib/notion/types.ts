export interface NotionEmployee {
  id: string;
  email: string;
  name: string;
}

export interface NotionProject {
  id: string;
  name: string;
  clientId: string;
  projectManagerId: string;
}

export interface NotionTask {
  id: string;
  name: string;
  projectId: string;
}

export interface TimeSheetEntry {
  id: string;
  employeeId: string;
  projectId: string;
  taskId: string;
  hoursWorked: number;
  date: string;
  description?: string;
}
