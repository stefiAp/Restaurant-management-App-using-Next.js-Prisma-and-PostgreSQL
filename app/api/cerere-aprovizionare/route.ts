import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { StatusCerere } from "@prisma/client";

export async function GET(){
    try {
       const cereriAprov = await prisma.cerereAprovizionare.findMany();

       return NextResponse.json(cereriAprov, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
        
    }
}

export async function POST(request: NextRequest) {
    try {

     const body = await request.json();
        const { id_gestiune   } = body;

        console.log(id_gestiune);

        if(!id_gestiune ) {
            return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
        }

        const valoare = 0;
        const doc = await prisma.document.create({
            data: {
                data: new Date(),
            }
        })

        const cerereAprov = await prisma.cerereAprovizionare.create({
            data: {
                id_cerere: doc.nr_document,
                id_gestiune,
                status: StatusCerere.IN_ASTEPTARE,
                data: new Date(),
                valoare
            }
        });

        return NextResponse.json(cerereAprov, { status: 201 });
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
        
    }
}
