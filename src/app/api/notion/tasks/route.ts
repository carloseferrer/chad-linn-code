import { NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { NOTION_CONFIG } from "@/lib/config/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface TitlePropertyValue {
  title: Array<{
    plain_text: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.databases.tasks,
      filter: {
        property: "📔 Projects",
        relation: {
          contains: projectId,
        },
      },
      sorts: [
        {
          property: "Phase Name",
          direction: "ascending",
        },
      ],
    });

    const tasks = response.results.map((task) => {
      const typedTask = task as PageObjectResponse;
      const nameProperty = typedTask.properties[
        "Phase Name"
      ] as TitlePropertyValue;

      return {
        id: typedTask.id,
        name: nameProperty.title[0]?.plain_text || "Untitled",
      };
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching tasks", error: error.message },
      { status: 500 }
    );
  }
}
