import { NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { NOTION_CONFIG } from "@/lib/config/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface TitlePropertyValue {
  title: Array<{
    plain_text: string;
  }>;
}

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.databases.projects,
      sorts: [
        {
          property: "Job Name",
          direction: "ascending",
        },
      ],
    });

    const projects = response.results.map((page) => {
      const typedPage = page as PageObjectResponse;
      const jobNameProperty = typedPage.properties[
        "Job Name"
      ] as TitlePropertyValue;

      return {
        id: typedPage.id,
        name: jobNameProperty.title[0]?.plain_text || "Untitled",
      };
    });

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching projects",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
