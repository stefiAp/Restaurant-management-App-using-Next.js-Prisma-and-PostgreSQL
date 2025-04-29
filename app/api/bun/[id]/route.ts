import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma" // Adjust the import path as necessary

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } }
) {

    try {
        const { id } = await context.params;
    const idNumeric = parseInt(id);
   
    if (isNaN(idNumeric)) {
      return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
    }
     const data = await request.json();
     const { nume_bun, cantitate_disponibila, pret_unitar, data_expirare, unitate_masura } = data;

     if(!nume_bun || !cantitate_disponibila || !pret_unitar || !data_expirare || !unitate_masura) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingBun = await prisma.bun.findUnique({
        where: { id_bun: idNumeric },
    });

    if (!existingBun) {
        return NextResponse.json({ error: 'Bunul nu a fost gasit' }, { status: 404 });

    }
    const updatedBun = await prisma.bun.update({
        where: { id_bun: idNumeric },
        data: {
            nume_bun,
            cantitate_disponibila,
            pret_unitar,
            data_expirare: data_expirare ? new Date(data_expirare) : null,
            unitate_masura
        }
    });


    if(!prisma.stoc.findMany({ where: { id_bun: idNumeric } })){}else{
        await prisma.stoc.updateMany({
            where: { id_bun: idNumeric },
            data: {
                stoc_actual: cantitate_disponibila,
            }
        });

        const dateOfAnalysis =  new Date().getDay();
        if(dateOfAnalysis === 1) {
            await prisma.stoc.updateMany({
                where: { id_bun: idNumeric },
                data: {
                    stoc_init_lunar: cantitate_disponibila,
                }
            });
        }
    }
    console.log('Bunul a fost actualizat cu succes!');
    return NextResponse.json(updatedBun, { status: 200 });
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });  
    } 
}

export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params;
        const idNumeric = parseInt(id);
        if(!idNumeric){
            return NextResponse.json({ error: 'Bunul nu a fost gasit' }, { status: 404 });
        }
        const existingBun = await prisma.bun.findUnique({
            where: { id_bun: idNumeric },
        });
        if (!existingBun) {
            return NextResponse.json({ error: 'Bunul nu a fost gasit' }, { status: 404 });
        }
        await prisma.stoc.deleteMany({
            where: { id_bun: idNumeric },
        });
        await prisma.bun.delete({
            where: { id_bun: idNumeric },
        });

        
        console.log('Bunul a fost sters cu succes!');
        return NextResponse.json({ message: 'Bunul a fost sters cu succes!' }, { status: 200 });
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        
    }
}
