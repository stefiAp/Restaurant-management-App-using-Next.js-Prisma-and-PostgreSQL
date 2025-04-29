import { NextRequest, NextResponse } from "next/server";

import  prisma  from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const liniiCerereAprovizionare = await prisma.linieCerereAprovizionare.findMany()

    return NextResponse.json(liniiCerereAprovizionare, { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const { id_cerere, id_bun, cantitate, observatii } = data;

        if (!id_cerere || !id_bun || !cantitate || !observatii ) {
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

        const valoare = Number( bun.pret_unitar) * cantitate;

        const newLinieCerereAprovizionare = await prisma.linieCerereAprovizionare.create({
            data: {
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
            data:{
                valoare:{
                    increment: valoare,
                }
            }
        });

        if (!cerere) {
            return NextResponse.json({ error: "Cerere not found" }, { status: 404 });
        }

        if(cerere.status === "APROBATA") {
            await prisma.bun.update({
                where: {
                    id_bun: id_bun,
                   
                },
                data: {
                    cantitate_disponibila: {
                        increment: cantitate,
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
                        increment: cantitate,
                    },
                },
            });
        }

        return NextResponse.json(newLinieCerereAprovizionare, { status: 201 });
    } catch (error) {
        console.error("Error creating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
