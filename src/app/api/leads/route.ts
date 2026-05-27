import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendSSEUpdate } from "@/app/api/sse/route";

const RULES: Record<number, { mandatory: number[]; pool: number[] }> = {
  1: { mandatory: [1], pool: [2, 3, 4] },
  2: { mandatory: [5], pool: [6, 7, 8] },
  3: { mandatory: [1, 4], pool: [2, 3, 5, 6, 7, 8] },
};

export async function POST(req: NextRequest) {
  try {
    const { name, phone, city, serviceId, description } = await req.json();
    const sid = Number(serviceId);

    if (!name || !phone || !city || !sid || !description) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    const rule = RULES[sid];
    if (!rule) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Prevent duplicate lead
      const existing = await tx.lead.findUnique({
        where: { phone_serviceId: { phone, serviceId: sid } },
      });
      if (existing) throw new Error("DUPLICATE_ENTRY");

      // 2. Create lead
      const lead = await tx.lead.create({
        data: { name, phone, city, serviceId: sid, description },
      });

      // 3. Ensure allocation state exists (Optimized with Upsert)
      const state = await tx.allocationState.upsert({
        where: { serviceId: sid },
        update: {},
        create: { serviceId: sid, poolIndex: 0 },
      });

      let index = state.poolIndex;
      const assigned: number[] = [];

      // 4. SAFE provider assignment (atomic quota protection)
      const assignProvider = async (providerId: number) => {
        if (assigned.includes(providerId)) return false;

        const updated = await tx.provider.updateMany({
          where: { id: providerId, leadsCount: { lt: 10 } },
          data: { leadsCount: { increment: 1 } },
        });

        if (updated.count > 0) assigned.push(providerId);
        return updated.count > 0;
      };

      // 5. Mandatory assignment first
      for (const pid of rule.mandatory) {
        await assignProvider(pid);
      }

      // 6. Round-robin fair allocation
      let attempts = 0;
      while (assigned.length < 3 && attempts < rule.pool.length * 2) {
        await assignProvider(rule.pool[index % rule.pool.length]);
        index++;
        attempts++;
      }

      // 7. HARD SAFETY CHECK
      if (assigned.length !== 3) throw new Error("ASSIGNMENT_FAILED");

      // 8. Update rotation state (Bounded index to prevent infinite growth)
      await tx.allocationState.update({
        where: { serviceId: sid },
        data: { poolIndex: index % rule.pool.length },
      });

      // 9. Save mappings
      await tx.leadAssignment.createMany({
        data: assigned.map((providerId) => ({ leadId: lead.id, providerId })),
      });

      return { lead, assigned };
    });

    // 10. Real-time update (Wrapped in try/catch to prevent response crashes)
    try {
      sendSSEUpdate({ type: "NEW_LEAD", lead: result.lead });
    } catch (e) {
      console.error("SSE Error:", e);
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("Lead API error:", error);

    if (error.message === "DUPLICATE_ENTRY") {
      return NextResponse.json({ success: false, error: "Duplicate lead not allowed" }, { status: 409 });
    }
    if (error.message === "ASSIGNMENT_FAILED") {
      return NextResponse.json({ success: false, error: "Unable to assign 3 providers (Quota full)" }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}