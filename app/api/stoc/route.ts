import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.stoc.findMany()
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    
  }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

        const actualStoc = await prisma.bun.findUnique({
            where: { id_bun }
        })

        if (!actualStoc) {
            return NextResponse.json({ error: "Bun not found" }, { status: 404 });
        }

        const allSameStocks = await prisma.stoc.findMany({
            where: {
                id_bun,
                id_gestiune
            }
        })

        if(allSameStocks.length > 0) {
            return NextResponse.json({ error: "Stoc already exists for this bun and gestiune" }, { status: 400 });

        }

        
        const data = await prisma.stoc.create({
            data: {
                id_bun,
                id_gestiune,
                stoc_init_lunar,
                stoc_actual: actualStoc.cantitate_disponibila,
                prag_minim,
                cantitate_optima
            }
        });
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}