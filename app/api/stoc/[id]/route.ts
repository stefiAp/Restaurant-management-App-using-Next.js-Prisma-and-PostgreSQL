import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req:NextRequest, context: {params: { id: string } }) {
    const { id } = await context.params;
    const idNumeric = parseInt(id);
    if (isNaN(idNumeric)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 404 });
    }
    
    const body = await req.json();
    const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

    if (!id_bun || !id_gestiune || !stoc_init_lunar || !prag_minim || !cantitate_optima) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    try {
        const data = await prisma.stoc.update({
            where: { id_stoc: idNumeric },  
            data: {
                id_bun,
                id_gestiune,
                stoc_init_lunar,
                prag_minim,
                cantitate_optima
            }
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req:NextRequest, context: {params: { id: string } }) {
    const { id } = await context.params;
    const idNumeric = parseInt(id);
    
    try {
        const data = await prisma.stoc.delete({
            where: { id_stoc: idNumeric }
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error deleting data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}