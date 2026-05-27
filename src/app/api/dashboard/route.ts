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
      orderBy: {
        id: "asc",
      },
    });

    // safe calculations
    const totalProviders = providers.length;

    const totalLeads = providers.reduce((sum, provider) => {
      return sum + (provider.leadsCount || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: providers, // IMPORTANT: keep array for frontend compatibility
      stats: {
        totalProviders,
        totalLeads,
      },
    });

  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        data: [],
        stats: {
          totalProviders: 0,
          totalLeads: 0,
        },
      },
      { status: 500 }
    );
  }
}