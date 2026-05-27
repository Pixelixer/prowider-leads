import { NextResponse } from 'next/server'
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        leadAssignments: {
          include: {
            lead: {
              include: {
                service: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const totalProviders = providers.length;

    const totalLeads = providers.reduce(
      (sum, provider) => sum + (provider.leadsCount || 0),
      0
    );

    // IMPORTANT: ALWAYS SAME SHAPE
    return NextResponse.json({
      success: true,
      data: {
        providers,
        totalProviders,
        totalLeads,
      },
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        data: {
          providers: [],
          totalProviders: 0,
          totalLeads: 0,
        },
      },
      { status: 500 }
    );
  }
}