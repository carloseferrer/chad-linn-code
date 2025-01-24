import { NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { NOTION_CONFIG } from "@/lib/config/notion";

export async function GET() {
  try {
    const results = await Promise.allSettled(
      Object.entries(NOTION_CONFIG.databases).map(async ([key, id]) => {
        try {
          const database = await notion.databases.retrieve({
            database_id: id,
          });

          // Obtener una muestra de registros (limitado a 5)
          const pages = await notion.databases.query({
            database_id: id,
            page_size: 5,
          });

          return {
            key,
            id,
            status: "success",
            title: database.title,
            sample_size: pages.results.length,
            properties: database.properties,
            sample_data: pages.results.map((page) => ({
              id: page.id,
              properties: page.properties,
            })),
          };
        } catch (error: any) {
          return {
            key,
            id,
            status: "error",
            error: error.message,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: "Prueba de conexión completada",
      results: results,
    });
  } catch (error: any) {
    console.error("Error general:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al conectar con Notion",
        error: {
          message: error.message,
          code: error.code,
          status: error.status,
        },
      },
      { status: 500 }
    );
  }
}
