import { NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { NOTION_CONFIG } from "@/lib/config/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface TitlePropertyValue {
  type: "title";
  title: Array<{
    plain_text: string;
  }>;
}

interface RelationPropertyValue {
  relation: Array<{
    id: string;
  }>;
}

interface RollupPropertyValue {
  rollup: {
    array: Array<{
      plain_text?: string;
      email?: string;
      rich_text?: Array<{
        plain_text: string;
      }>;
    }>;
  };
}

interface DatePropertyValue {
  date: {
    start: string;
  } | null;
}

interface NumberPropertyValue {
  number: number | null;
}

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.databases.timesheet,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const entries = await Promise.all(
      response.results.map(async (entry) => {
        const typedEntry = entry as PageObjectResponse;
        const properties = typedEntry.properties;

        // Obtener todos los IDs de proyectos y tareas
        const projectIds = (
          properties["📔 Projects"] as RelationPropertyValue
        ).relation.map((rel) => rel.id);
        const taskIds = (
          properties["☑️ Tasks/Phases"] as RelationPropertyValue
        ).relation.map((rel) => rel.id);
        const employeeId = (properties["👨🏻‍💼 Employees"] as RelationPropertyValue)
          .relation[0]?.id;

        // Obtener detalles de todos los proyectos y tareas
        const [projectPages, taskPages, employeePage] = await Promise.all([
          Promise.all(
            projectIds.map((id) => notion.pages.retrieve({ page_id: id }))
          ),
          Promise.all(
            taskIds.map((id) => notion.pages.retrieve({ page_id: id }))
          ),
          employeeId ? notion.pages.retrieve({ page_id: employeeId }) : null,
        ]);

        const projects = projectPages.map((page) => ({
          id: page.id,
          name:
            (
              (page as PageObjectResponse).properties[
                "Job Name"
              ] as TitlePropertyValue
            ).title[0]?.plain_text || "Unknown Project",
        }));

        const tasks = taskPages.map((page) => ({
          id: page.id,
          name:
            (
              (page as PageObjectResponse).properties[
                "Phase Name"
              ] as TitlePropertyValue
            ).title[0]?.plain_text || "Unknown Task",
        }));

        const employeeEmail =
          (properties["Employee Email"] as RollupPropertyValue).rollup.array[0]
            ?.rich_text?.[0]?.plain_text || "";

        const employeeName = employeePage
          ? (
              (employeePage as PageObjectResponse).properties[
                "Full Name"
              ] as TitlePropertyValue
            ).title[0]?.plain_text || "Unknown Employee"
          : "Unknown Employee";

        const description =
          (properties["Notes"] as TitlePropertyValue)?.title[0]?.plain_text ||
          "";

        return {
          id: typedEntry.id,
          projects, // Ahora retornamos arrays
          tasks, // Ahora retornamos arrays
          employee: {
            id: employeeId || "",
            name: employeeName,
            email: employeeEmail,
          },
          date: (properties["Date"] as DatePropertyValue).date?.start || "",
          hoursWorked:
            (properties["⌛ Hours Worked"] as NumberPropertyValue).number || 0,
          description,
        };
      })
    );

    // Obtener proyectos y tareas únicos
    const uniqueProjects = Array.from(
      new Set(entries.flatMap((entry) => entry.projects))
    );
    const uniqueTasks = Array.from(
      new Set(entries.flatMap((entry) => entry.tasks))
    );

    return NextResponse.json({
      success: true,
      entries,
      projects: uniqueProjects,
      tasks: uniqueTasks,
    });
  } catch (error) {
    console.error("Error fetching timesheet entries:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching timesheet entries",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, taskId, date, hoursWorked, description, employeeId } =
      body;

    // Create individual entries for each task
    const entries = await Promise.all(
      taskId.map(async (task: string, index: number) => {
        return await notion.pages.create({
          parent: {
            database_id: NOTION_CONFIG.databases.timesheet,
          },
          properties: {
            "📔 Projects": {
              relation: projectId.map((id: string) => ({ id })), // Ahora incluye todos los proyectos seleccionados
            },
            "☑️ Tasks/Phases": {
              relation: [{ id: task }],
            },
            "👨🏻‍💼 Employees": {
              relation: [{ id: employeeId }],
            },
            Date: {
              date: { start: date },
            },
            "⌛ Hours Worked": {
              number: hoursWorked[index],
            },
            Notes: {
              title: [
                {
                  text: {
                    content: description || "",
                  },
                },
              ],
            },
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: "Time entries created successfully",
      entries: entries,
    });
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating time entry",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
