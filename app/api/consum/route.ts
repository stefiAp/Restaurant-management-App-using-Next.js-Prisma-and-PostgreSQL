import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(){
    try {
        const consum = await prisma.consum.findMany();
        return NextResponse.json(consum, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Error fetching data"}, {status: 500});
        
    }
}

export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        const { id_sef, id_gestiune} = body;

        if ( !id_sef || !id_gestiune) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400});
        }
        const dataActuala = new Date().toISOString();
        console.log(dataActuala);
        const doc = await prisma.document.create({
            data:{
                data: dataActuala
            }
        })
        const valoare = 0;
        const consum = await prisma.consum.create({
            data: {
                id_consum: doc.nr_document,
                valoare,
                id_sef,
                id_gestiune,
                data: dataActuala
            }
        });
        return NextResponse.json(consum, {status: 201});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Error creating data"}, {status: 500});
        
    }
}
