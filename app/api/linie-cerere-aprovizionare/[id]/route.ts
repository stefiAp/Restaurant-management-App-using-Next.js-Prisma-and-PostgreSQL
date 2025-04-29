import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, context: {params: { id: string }}) {
    const { id } = context.params;
    const data = await req.json();

    const { id_cerere, id_bun, cantitate, observatii } = data;

    if (!id_cerere || !id_bun || !cantitate || !observatii) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bun = await prisma.bun.findUnique({
        where: {
            id_bun: id_bun,
        },
    });
    if (!bun) {
        return NextResponse.json({ error: "Bun not found" }, { status: 404 });
    }

    const valoare = Number(bun.pret_unitar) * cantitate;

    const linieAprovVeche = await prisma.linieCerereAprovizionare.findUnique({
        where: {
            id: Number(id),
        },
    });



    try {
        const updatedLinieCerereAprovizionare = await prisma.linieCerereAprovizionare.update({
            where: {id: Number(id) },
            data:{
                id_cerere,
                id_bun,
                cantitate,
                valoare,
                observatii,
            },
        });

        const cerere = await prisma.cerereAprovizionare.update({
            where: {
                id_cerere: id_cerere,
            },
            data: {
                valoare: {
                    increment: valoare - Number(linieAprovVeche?.valoare),
                },
            },
        });

        if(cerere.status === "APROBATA") {
            await prisma.bun.update({
                where: {
                    id_bun: id_bun,
                },
                data: {
                    cantitate_disponibila: {
                        increment: cantitate - Number(linieAprovVeche?.cantitate),
                    },
                },
            });

            await prisma.stoc.updateMany({
                where: {
                    id_bun: id_bun,
                    id_gestiune: cerere.id_gestiune,
                },
                data: {
                    stoc_actual: {
                        increment: cantitate - Number(linieAprovVeche?.cantitate),
                    },
                },
            });
        }

        return NextResponse.json(updatedLinieCerereAprovizionare, { status: 200 });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: {params: { id: string }}) {
    const { id } = context.params;

    try {
        const linieCerereAprovizionare = await prisma.linieCerereAprovizionare.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!linieCerereAprovizionare) {
            return NextResponse.json({ error: "Linie Cerere Aprovizionare not found" }, { status: 404 });
        }

        const cerere = await prisma.cerereAprovizionare.update({
            where: {
                id_cerere: linieCerereAprovizionare.id_cerere,
            },
            data: {
                valoare: {
                    decrement: Number(linieCerereAprovizionare.valoare),
                },
            },
        });

        if (cerere.status === "APROBATA") {
            await prisma.bun.update({
                where: {
                    id_bun: linieCerereAprovizionare.id_bun,
                },
                data: {
                    cantitate_disponibila: {
                        decrement: Number(linieCerereAprovizionare.cantitate),
                    },
                },
            });

            await prisma.stoc.updateMany({
                where: {
                    id_bun: linieCerereAprovizionare.id_bun,
                    id_gestiune: cerere.id_gestiune,
                },
                data: {
                    stoc_actual: {
                        decrement: Number(linieCerereAprovizionare.cantitate),
                    },
                },
            });
        }

        await prisma.linieCerereAprovizionare.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: "Linie Cerere Aprovizionare deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}