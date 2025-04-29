import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";


export async function PUT(req:NextRequest, context:{params:{id:string}}) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
        }

        if(status === "APROBATA") {
            const cerere = await prisma.cerereAprovizionare.findUnique({
                where: {
                    id_cerere: Number(id),
                },
            });

            if (!cerere) {
                return NextResponse.json({ error: "Cerere nu exista" }, { status: 404 });
            }

            const liniiCerere = await prisma.linieCerereAprovizionare.findMany({
                where: {
                    id_cerere: Number(id),
                },
            });

            for (const linie of liniiCerere) {
                await prisma.bun.update({
                    where: {
                        id_bun: linie.id_bun,
                    },
                    data: {
                        cantitate_disponibila: {
                            increment: linie.cantitate,
                        },
                    },
                });

                await prisma.stoc.updateMany({
                    where: {
                        id_bun: linie.id_bun,
                        id_gestiune: cerere.id_gestiune,
                    },
                    data: {
                        stoc_actual: {
                            increment: linie.cantitate,
                        },
                    }})

            }
        }

        const cerereAprov = await prisma.cerereAprovizionare.update({
            where: {
                id_cerere: Number(id),
            },
            data: {
                status,
            },
        });

        return NextResponse.json(cerereAprov, { status: 200 });
    } catch (error) { 
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest,context:{params:{id:string}}) {
    try {
        const { id } = await context.params;

        const cerereAprov = await prisma.cerereAprovizionare.findUnique({
            where: {
                id_cerere: Number(id),
            },
        });

        if (!cerereAprov) {
            return NextResponse.json({ error: "Cerere nu exista" }, { status: 404 });
        }
        const liniiCerere = await prisma.linieCerereAprovizionare.findMany({
            where: {
                id_cerere: Number(id),
            },
        });
        for (const linie of liniiCerere) {
            if(cerereAprov.status === "APROBATA") {
                await prisma.bun.update({
                    where: {
                        id_bun: linie.id_bun,
                    },
                    data: {
                        cantitate_disponibila: {
                            decrement: linie.cantitate,
                        },
                    },
                });
    
                await prisma.stoc.updateMany({
                    where: {
                        id_bun: linie.id_bun,
                        id_gestiune: cerereAprov.id_gestiune,
                    },
                    data: {
                        stoc_actual: {
                            decrement: linie.cantitate,
                        },
                    },
                });
            }
            await prisma.linieCerereAprovizionare.delete({
                where: {
                    id: linie.id,
                },
            });
        }
       

       await prisma.cerereAprovizionare.delete({
            where: {
                id_cerere: Number(id),
            },
        });

         await prisma.document.delete({
            where: {
                nr_document: Number(id),
            },
        })

        

        return NextResponse.json("Document sters cu succes", { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}