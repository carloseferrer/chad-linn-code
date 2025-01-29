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

interface RichTextPropertyValue {
  type: "rich_text";
  rich_text: Array<{
    plain_text: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.databases.employees,
      filter: email
        ? {
            property: "Email",
            rich_text: {
              equals: email,
            },
          }
        : undefined,
    });

    const employees = response.results.map((employee) => {
      const typedEmployee = employee as PageObjectResponse;
      const properties = typedEmployee.properties;

      return {
        id: typedEmployee.id,
        name:
          (properties["Full Name"] as TitlePropertyValue).title[0]
            ?.plain_text || "",
        email:
          (properties["Email"] as RichTextPropertyValue).rich_text[0]
            ?.plain_text || "",
      };
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching employees",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, hourlyRate } = body;

    // 1. Crear página en la base de datos de empleados de Notion
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_CONFIG.databases.employees,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `${firstName} ${lastName}`,
              },
            },
          ],
        },
        Email: {
          email: email,
        },
        "Hourly Rate": {
          number: hourlyRate,
        },
        Status: {
          select: {
            name: "Active",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      employee: response,
    });
  } catch (error: unknown) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating employee",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
