import { NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { NOTION_CONFIG } from "@/lib/config/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface RelationPropertyValue {
  relation: Array<{
    id: string;
  }>;
}

interface RollupPropertyValue {
  rollup: {
    array: Array<{
      title: Array<{
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
      filter: {
        and: [
          {
            property: "Date",
            date: {
              is_not_empty: true,
            },
          },
        ],
      },
    });

    const entries = await Promise.all(
      response.results.map(async (entry) => {
        const typedEntry = entry as PageObjectResponse;
        const properties = typedEntry.properties;

        const projectId = (properties["📔 Projects"] as RelationPropertyValue)
          .relation[0]?.id;
        const taskId = (properties["☑️ Tasks/Phases"] as RelationPropertyValue)
          .relation[0]?.id;
        const employeeId = (properties["👨🏻‍💼 Employees"] as RelationPropertyValue)
          .relation[0]?.id;

        const [projectPage, taskPage, employeePage] = await Promise.all([
          projectId ? notion.pages.retrieve({ page_id: projectId }) : null,
          taskId ? notion.pages.retrieve({ page_id: taskId }) : null,
          employeeId ? notion.pages.retrieve({ page_id: employeeId }) : null,
        ]);

        return {
          id: typedEntry.id,
          project: {
            id: projectId || "",
            name: projectPage
              ? (projectPage as PageObjectResponse).properties["Job Name"]
                  ?.title[0]?.plain_text || "Unknown Project"
              : "Unknown Project",
          },

          task: {
            id: taskId || "",
            name: taskPage
              ? (taskPage as PageObjectResponse).properties["Phase Name"]
                  .title[0]?.plain_text || "Unknown Task"
              : "Unknown Task",
          },
          employee: {
            id: employeeId || "",
            name: employeePage
              ? (employeePage as PageObjectResponse).properties["Full Name"]
                  .title[0]?.plain_text || "Unknown Employee"
              : "Unknown Employee",
          },
          date: (properties["Date"] as DatePropertyValue).date?.start || "",
          hoursWorked:
            (properties["⌛ Hours Worked"] as NumberPropertyValue).number || 0,
          description: properties["Notes"]?.title[0]?.plain_text || "",
        };
      })
    );

    return NextResponse.json({
      success: true,
      entries,
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

    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_CONFIG.databases.timesheet,
      },
      properties: {
        "📔 Projects": {
          relation: [{ id: projectId }],
        },
        "☑️ Tasks/Phases": {
          relation: [{ id: taskId }],
        },
        "👨🏻‍💼 Employees": {
          relation: [{ id: employeeId }],
        },
        Date: {
          date: { start: date },
        },
        "⌛ Hours Worked": {
          number: hoursWorked,
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

    return NextResponse.json({
      success: true,
      message: "Time entry created successfully",
      entry: response,
    });
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating time entry",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
