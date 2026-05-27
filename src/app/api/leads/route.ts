import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PrismaClient, Prisma } from '@prisma/client';
import { sendSSEUpdate } from "@/app/api/sse/route";

const MANDATORY: Record<number, number[]> = {
  1: [1],
  2: [5],
  3: [1, 4],
};

const POOLS: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, city, serviceId, description } = body;

    const sid = Number(serviceId);

    if (!name || !phone || !city || !serviceId || !description) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Prevent duplicate lead (DB level safety)
      const existing = await tx.lead.findUnique({
        where: { phone_serviceId: { phone, serviceId: sid } },
      });

      if (existing) {
        throw new Error("DUPLICATE_ENTRY");
      }

      // 2. Create lead
      const lead = await tx.lead.create({
        data: {
          name,
          phone,
          city,
          serviceId: sid,
          description,
        },
      });

      // 3. Ensure allocation state exists
      let state = await tx.allocationState.findUnique({
        where: { serviceId: sid },
      });

      if (!state) {
        state = await tx.allocationState.create({
          data: {
            serviceId: sid,
            poolIndex: 0,
          },
        });
      }

      let index = state.poolIndex;

      const assigned: number[] = [];

      // 4. SAFE provider assignment (atomic quota protection)
      const assignProvider = async (providerId: number) => {
        if (assigned.includes(providerId)) return false;

        const updated = await tx.provider.updateMany({
          where: {
            id: providerId,
            leadsCount: { lt: 10 },
          },
          data: {
            leadsCount: { increment: 1 },
          },
        });

        if (updated.count === 0) return false;

        assigned.push(providerId);
        return true;
      };

      // 5. Mandatory assignment first
      for (const pid of MANDATORY[sid] || []) {
        await assignProvider(pid);
      }

      // 6. Round-robin fair allocation
      const pool = POOLS[sid] || [];
      let attempts = 0;

      while (assigned.length < 3 && attempts < pool.length * 2) {
        const pid = pool[index % pool.length];
        index++;
        attempts++;

        await assignProvider(pid);
      }

      // 7. HARD SAFETY CHECK (important)
      if (assigned.length !== 3) {
        throw new Error("ASSIGNMENT_FAILED");
      }

      // 8. Update rotation state
      await tx.allocationState.update({
        where: { serviceId: sid },
        data: {
          poolIndex: index,
        },
      });

      // 9. Save mappings
      await tx.leadAssignment.createMany({
        data: assigned.map((providerId) => ({
          leadId: lead.id,
          providerId,
        })),
      });

      return { lead, assigned };
    });

    // 10. Real-time update
    sendSSEUpdate({
      type: "NEW_LEAD",
      lead: result.lead,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lead API error:", error);

    if (error.message === "DUPLICATE_ENTRY") {
      return NextResponse.json(
        { success: false, error: "Duplicate lead not allowed" },
        { status: 409 }
      );
    }

    if (error.message === "ASSIGNMENT_FAILED") {
      return NextResponse.json(
        { success: false, error: "Unable to assign 3 providers" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
