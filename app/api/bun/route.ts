import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';



export async function GET() {
    try {
        const bunuri = await prisma.bun.findMany();
        return NextResponse.json(bunuri);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { nume_bun, cantitate_disponibila, pret_unitar, data_expirare, unitate_masura } = data;

        if(!nume_bun || !cantitate_disponibila || !pret_unitar || !data_expirare || !unitate_masura) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        
        const bunNou = await prisma.bun.create({
            data: {
                nume_bun,
                cantitate_disponibila,
                pret_unitar,
                data_expirare: data_expirare ? new Date(data_expirare) : null,
                unitate_masura
            }
        });
        console.log('Bunul a fost adaugat cu succes!');
        return NextResponse.json(bunNou, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

