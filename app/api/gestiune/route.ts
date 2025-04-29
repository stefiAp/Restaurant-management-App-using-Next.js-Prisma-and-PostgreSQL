import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(){
    try {
        const data = await prisma.gestiune.findMany();
        return NextResponse.json(data, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Error fetching data"}, {status: 500});
        
    }
}

export async function POST(request: NextRequest){
    try {
        const data = await request.json();
        const { denumire, id_gestionar } = data;

    

        if(!denumire || !id_gestionar) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const gestiuneNoua = await prisma.gestiune.create({
            data: {
                denumire,
                id_gestionar
            }
        });
        console.log('Gestiunea a fost adaugata cu succes!');
        return NextResponse.json(gestiuneNoua, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
