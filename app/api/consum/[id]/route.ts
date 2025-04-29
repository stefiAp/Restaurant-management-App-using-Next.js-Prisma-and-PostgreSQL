import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { valoare, id_sef, id_gestiune } = body;
        const { id } = await context.params;

        if (!valoare || !id_sef || !id_gestiune) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const doc = await prisma.document.update({
            where: { nr_document: parseInt(id) },
            data: {
                data: new Date().toISOString(),
            },
        });

        const consum = await prisma.consum.update({
            where: { id_consum: parseInt(id) },
            data: {
                valoare,
                id_sef,
                id_gestiune,
                data: doc.data
            },
        });

        return NextResponse.json(consum, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error updating data" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;

        const consumVechi = await prisma.consum.findUnique({
            where: { id_consum: parseInt(id) },
        });

        if (!consumVechi) {
            return NextResponse.json({ error: "Consum not found" }, { status: 404 });
        }

        const liniiConsum = await prisma.linieConsum.findMany({
            where: { id_consum: parseInt(id) }})

        if (liniiConsum.length > 0) {
           
        for(const linie of liniiConsum) {
            const id_bun = linie.id_bun;

            await prisma.linieConsum.delete({
                where: { id_linie_consum: linie.id_linie_consum }
            })

            await prisma.bun.update({
                where: { id_bun: id_bun },
                data: {
                    cantitate_disponibila: {
                        increment: linie.cant_eliberata
                    }
                }
            })

            await prisma.stoc.updateMany({
                where:{
                    id_bun: id_bun,
                    id_gestiune: consumVechi.id_gestiune
                },
                data: {
                    stoc_actual: {
                        increment: linie.cant_eliberata
                    }
                }
            })
        }

        }

        const consum = await prisma.consum.delete({
            where: { id_consum: parseInt(id) },
        });


        await prisma.document.delete({
            where: { nr_document: parseInt(id) },
        });
        return NextResponse.json(consum, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error deleting data" }, { status: 500 });
    }
}