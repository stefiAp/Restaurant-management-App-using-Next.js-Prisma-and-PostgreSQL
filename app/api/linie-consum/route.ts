import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(){
    try {
        const linieConsum = await prisma.linieConsum.findMany();
        return NextResponse.json(linieConsum, {status: 200});

    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Error fetching data"}, {status: 500});
        
    }
}

export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        const {id_bun, id_consum, cantitate_necesara, cant_eliberata} = body;

        if (!id_bun || !id_consum || !cantitate_necesara || !cant_eliberata) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400});
        }

        
        
        const bun = await prisma.bun.findUnique({
            where: {
                id_bun: parseInt(id_bun)
            }
        });

        if (!bun) {
            return NextResponse.json({error: "Bun not found"}, {status: 404});
        } 

        

        await prisma.bun.update({
            where: {
                id_bun: parseInt(id_bun)
            },
            data: {
                cantitate_disponibila: {
                    decrement: cant_eliberata
                }
            }
        })
        const consum = await prisma.consum.findUnique({
            where:{
                id_consum: parseInt(id_consum)
            }
        })

        

        if (!consum) {
            return NextResponse.json({error: "Consum not found"}, {status: 404});
        }
        

        

        const stoc = await prisma.stoc.findFirst({
            where: {
                id_bun: parseInt(id_bun),
                id_gestiune: consum?.id_gestiune
            }
        })

        if (!stoc ) {
            return NextResponse.json({error: "Nu exista bunul inregistrat in stoc. Va rog sa inregistrati in stoc bunul."}, {status: 404});
        }

        if(cant_eliberata > bun.cantitate_disponibila) {
            const gestiune = Number(consum.id_gestiune);
            const cerereResponse = await fetch("http://localhost:3000/api/cerere-aprovizionare", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                 
                    id_gestiune: gestiune
                  
                })
              });

              if (!cerereResponse.ok) {
                console.error("Cererea de aprovizionare a eșuat:", await cerereResponse.text());
            }

            const responseObject = await cerereResponse.json();
            console.log(responseObject);

            const linieCerereResponse = await fetch("http://localhost:3000/api/linie-cerere-aprovizionare", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_cerere: responseObject.id_cerere,
                    id_bun: bun.id_bun,
                    cantitate: stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2,
                    observatii: "Cerere de aprovizionare automata"
                })
              });

              if (!linieCerereResponse.ok) {
                console.error("Crearea liniei cererii de aprovizionare a eșuat:", await linieCerereResponse.text());
            }
            

            return NextResponse.json({
                error: "Cantitate insuficienta. Cerere de aprovizionare a fost trimisa.",
                cerereId: responseObject.id_cerere,
                cantitateDisponibila: bun.cantitate_disponibila,
                cantitateNecesara: cant_eliberata
            }, {status: 400});
        }

        await prisma.stoc.updateMany({
            where: {
                id_bun: parseInt(id_bun),
                id_gestiune: consum?.id_gestiune
            },
            data: {
                stoc_actual: {
                    decrement: cant_eliberata
                }
            }
        })
    
        const val = Number(bun.pret_unitar) * cant_eliberata;

        const linieConsum = await prisma.linieConsum.create({
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
                    increment: val
                }
            }
        });
        return NextResponse.json(linieConsum, {status: 201});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Error creating data"}, {status: 500});
        
    }
}
