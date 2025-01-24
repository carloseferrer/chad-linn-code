import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "./client";
import { NOTION_CONFIG } from "../config/notion";
import type {
  NotionEmployee,
  NotionProject,
  NotionTask,
  TimeSheetEntry,
} from "./types";

type PropertyType = {
  Email: { type: "email"; email: string };
  Name: { type: "title"; title: Array<{ plain_text: string }> };
  Client: { type: "relation"; relation: Array<{ id: string }> };
  Project: { type: "relation"; relation: Array<{ id: string }> };
  ProjectManager: { type: "relation"; relation: Array<{ id: string }> };
};

export async function getEmployees(): Promise<NotionEmployee[]> {
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.databases.employees,
  });

  return response.results.map((page) => {
    const typedPage = page as PageObjectResponse;
    const properties = typedPage.properties as unknown as PropertyType;

    return {
      id: typedPage.id,
      email: properties.Email?.email || "",
      name: properties.Name?.title[0]?.plain_text || "",
    };
  });
}

export async function getProjects(): Promise<NotionProject[]> {
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.databases.projects,
  });

  return response.results.map((page) => {
    const typedPage = page as PageObjectResponse;
    const properties = typedPage.properties as unknown as PropertyType;

    return {
      id: typedPage.id,
      name: properties.Name?.title[0]?.plain_text || "",
      clientId: properties.Client?.relation[0]?.id || "",
      projectManagerId: properties.ProjectManager?.relation[0]?.id || "",
    };
  });
}

export async function getTasks(projectId: string): Promise<NotionTask[]> {
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.databases.tasks,
    filter: {
      property: "Project",
      relation: {
        contains: projectId,
      },
    },
  });

  return response.results.map((page) => {
    const typedPage = page as PageObjectResponse;
    const properties = typedPage.properties as unknown as PropertyType;

    return {
      id: typedPage.id,
      name: properties.Name?.title[0]?.plain_text || "",
      projectId: properties.Project?.relation[0]?.id || "",
    };
  });
}

export async function createTimeSheetEntry(data: Omit<TimeSheetEntry, "id">) {
  return await notion.pages.create({
    parent: {
      database_id: NOTION_CONFIG.databases.timesheet,
    },
    properties: {
      Employee: {
        relation: [{ id: data.employeeId }],
      },
      Project: {
        relation: [{ id: data.projectId }],
      },
      "Task/Phase": {
        relation: [{ id: data.taskId }],
      },
      "Hours Worked": {
        number: data.hoursWorked,
      },
      Date: {
        date: {
          start: data.date,
        },
      },
      Description: {
        rich_text: [
          {
            text: {
              content: data.description || "",
            },
          },
        ],
      },
    },
  });
}
