import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendSSEUpdate } from "../sse/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Idempotency check
      const existing = await tx.webhookEvent.findUnique({
        where: { eventId },
      });

      if (existing) return null;

      // Event log karo
      await tx.webhookEvent.create({
        data: { eventId },
      });

      // Saare providers ka quota reset karo
      await tx.provider.updateMany({
        data: {
          monthlyQuota: 10,
          leadsCount: 0,
        },
      });

      const providers = await tx.provider.findMany({
        orderBy: { id: 'asc' },
      });

      return providers;
    });

    if (!result) {
      return NextResponse.json({
        success: true,
        message: "Duplicate webhook ignored",
      });
    }

    sendSSEUpdate({
      type: "QUOTA_RESET",
      message: "All provider quotas reset to 10",
    });

    return NextResponse.json({
      success: true,
      message: "All provider quotas reset successfully",
      data: result,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}