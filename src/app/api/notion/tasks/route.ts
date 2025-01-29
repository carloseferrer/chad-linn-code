import { NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { NOTION_CONFIG } from "@/lib/config/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface TitlePropertyValue {
  title: {
    plain_text: string;
  }[];
}

interface RelationPropertyValue {
  relation: Array<{
    id: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIds = searchParams.get("projectIds")?.split(",");

    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.databases.tasks,
      filter: projectIds
        ? {
            property: "📔 Projects",
            relation: {
              contains: projectIds[0],
            },
          }
        : undefined,
      sorts: [
        {
          property: "Phase Name",
          direction: "ascending",
        },
      ],
    });

    let tasks = response.results.map((page) => {
      const typedPage = page as PageObjectResponse;
      return {
        id: typedPage.id,
        name:
          (typedPage.properties["Phase Name"] as TitlePropertyValue).title[0]
            ?.plain_text || "Unknown Task",
        projectIds: (
          typedPage.properties["📔 Projects"] as RelationPropertyValue
        ).relation.map((rel) => rel.id),
      };
    });

    if (projectIds && projectIds.length > 1) {
      tasks = tasks.filter((task) =>
        task.projectIds.some((id) => projectIds.includes(id))
      );
    }

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
