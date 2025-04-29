import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, context:{params:{id:string}}) {
    try{
    const { id } = await context.params;
    const body = await req.json();
    const { id_bun, id_consum, cantitate_necesara, cant_eliberata } = body;

    if (!id_bun || !id_consum || !cantitate_necesara || !cant_eliberata) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

   
        const bun = await prisma.bun.findUnique({
            where: {
                id_bun: parseInt(id_bun)
            }
        });

        if (!bun) {
            return NextResponse.json({ error: "Bun not found" }, { status: 404 });
        }

        const val = Number(bun.pret_unitar) * cant_eliberata;

       

        const linieConsumVeche = await prisma.linieConsum.findUnique({
            where: {
                id_linie_consum: parseInt(id)
            }
        })

        await prisma.bun.update({
            where: {
                id_bun: parseInt(id_bun)
            },
            data: {
                cantitate_disponibila: {
                    decrement: -cant_eliberata+Number(linieConsumVeche?.cant_eliberata)
                }
            }
        });

        const consum = await prisma.consum.findUnique({
            where:{
                id_consum: parseInt(id_consum)
            }
        })

        await prisma.stoc.updateMany({
            where: {
                id_bun: parseInt(id_bun),
                id_gestiune: consum?.id_gestiune
            },
            data: {
                stoc_actual: {
                    increment: -cant_eliberata+Number(linieConsumVeche?.cant_eliberata)
                }
            }
        })

        const valoareInit = Number(linieConsumVeche?.valoare) || 0;

        console.log(valoareInit);

        const linieConsum = await prisma.linieConsum.update({
            where: {
                id_linie_consum: parseInt(id)
            },
            data: {
                id_bun: parseInt(id_bun),
                id_consum: parseInt(id_consum),
                cantitate_necesara,
                cant_eliberata,
                valoare: val
            }
        });

        

        await prisma.consum.update({
            where: {
                id_consum: parseInt(id_consum)
            },
            data: {
                valoare: {
                    increment: Number(val - valoareInit)
                }
            }
        });

        return NextResponse.json(linieConsum, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error updating data" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context:{params:{id:string}}) {
    try{
        const { id } = await context.params;
        const linieConsum = await prisma.linieConsum.findUnique({
            where: {
                id_linie_consum: parseInt(id)
            }
        });

        if (!linieConsum) {
            return NextResponse.json({ error: "Linie consum not found" }, { status: 404 });
        }

        const val = Number(linieConsum?.valoare) || 0;

        await prisma.linieConsum.delete({
            where: {
                id_linie_consum: parseInt(id)
            }
        });

        await prisma.consum.update({
            where: {
                id_consum: linieConsum.id_consum
            },
            data: {
                valoare: {
                    decrement: Number(val)
                }
            }
        });

        await prisma.bun.update({
            where: {
                id_bun: linieConsum.id_bun
            },
            data: {
                cantitate_disponibila: {
                    increment: Number(linieConsum.cant_eliberata)
                }
            }
        });

        const consum = await prisma.consum.findUnique({
                    where:{
                        id_consum: linieConsum.id_consum
                    }
                })
        
        await prisma.stoc.updateMany({
                    where: {
                        id_bun: linieConsum.id_bun,
                        id_gestiune: consum?.id_gestiune
                    },
                    data: {
                        stoc_actual: {
                            increment: linieConsum.cant_eliberata
                        }
                    }
                })


        return NextResponse.json({ message: "Linie consum deleted" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error deleting data" }, { status: 500 });
    }
}