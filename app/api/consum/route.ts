import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
    try {
        const consum = await prisma.consum.findMany();
        return NextResponse.json(consum, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_sef, id_gestiune, data, linii } = body;

        if (!id_sef || !id_gestiune || !linii || !Array.isArray(linii) || linii.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Folosim o tranzacție pentru a asigura consistența datelor
        return await prisma.$transaction(async (tx) => {
            // 1. Creăm documentul

            const doc = await tx.document.create({
                data: {
                    data: new Date()
                }
            });

            // 2. Calculăm valoarea totală inițială (va fi actualizată pe măsură ce procesăm liniile)
            let valoareTotala = 0;

            // 3. Creăm consumul principal
            const consum = await tx.consum.create({
                data: {
                    id_consum: doc.nr_document,
                    valoare: valoareTotala,
                    id_sef: Number(id_sef),
                    id_gestiune: Number(id_gestiune),
                    data: new Date()
                }
            });

            // 4. Procesăm fiecare linie de consum
            const liniiCreated = [];
            const cereriAprovizionare = new Map(); // Pentru a ține evidența cererii de aprovizionare pentru fiecare gestiune

            for (const linie of linii) {
                const { id_bun, cantitate_necesara, cant_eliberata } = linie;

                if (!id_bun || !cantitate_necesara || !cant_eliberata) {
                    throw new Error(`Linia de consum pentru bunul ${id_bun} are câmpuri lipsă`);
                }

                // Verificăm bunul
                const bun = await tx.bun.findUnique({
                    where: {
                        id_bun: Number(id_bun)
                    }
                });

                if (!bun) {
                    throw new Error(`Bunul cu ID-ul ${id_bun} nu a fost găsit`);
                }

                // Verificăm stocul
                const stoc = await tx.stoc.findFirst({
                    where: {
                        id_bun: Number(id_bun),
                        id_gestiune: consum.id_gestiune
                    }
                });

                if (!stoc) {
                    throw new Error(`Nu există bunul înregistrat în stoc pentru gestiunea specificată`);
                }

                // Verificăm disponibilitatea cantității
                if (cant_eliberata > Number(bun.cantitate_disponibila)) {
                    // În loc să facem cerere HTTP, operăm direct în tranzacție
                    let cerereId;

                    // Verificăm dacă avem deja o cerere de aprovizionare pentru această gestiune
                    if (!cereriAprovizionare.has(consum.id_gestiune)) {
                        // Creăm cererea de aprovizionare
                        // Adăugăm toate câmpurile obligatorii conform schemei
                        const documentCerere = await tx.document.create({
                            data: {
                                data: new Date()
                            }
                        });

                        const cerereNoua = await tx.cerereAprovizionare.create({
                            data: {
                                id_cerere: documentCerere.nr_document, // Folosim nr_document ca id_cerere
                                id_gestiune: consum.id_gestiune,
                                data: new Date(),
                                valoare: 0, // Valoare inițială, va fi actualizată după adăugarea liniilor
                            }
                        });
                        cerereId = cerereNoua.id_cerere;
                        cereriAprovizionare.set(consum.id_gestiune, cerereId);
                    } else {
                        cerereId = cereriAprovizionare.get(consum.id_gestiune);
                    }

                    // Cantitatea necesară pentru aprovizionare
                    const cantitateNecesara = stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2;

                    // Calculăm valoarea pentru linia cererii
                    const valoareLinieCerere = Number(bun.pret_unitar) * Number(cantitateNecesara);

                    // Creăm linia cererii
                    await tx.linieCerereAprovizionare.create({
                        data: {
                            id_cerere: cerereId,
                            id_bun: bun.id_bun,
                            cantitate: cantitateNecesara,
                            valoare: valoareLinieCerere, // Adăugăm valoarea conform schemei
                            observatii: "Cerere de aprovizionare automată"
                        }
                    });

                    // Actualizăm valoarea totală a cererii
                    await tx.cerereAprovizionare.update({
                        where: {
                            id_cerere: cerereId
                        },
                        data: {
                            valoare: {
                                increment: valoareLinieCerere
                            }
                        }
                    });

                    throw new Error(`Cantitate insuficientă pentru bunul ${bun.nume_bun}. Cerere de aprovizionare a fost creată.`);
                }

                // Actualizăm stocul bunului
                await tx.bun.update({
                    where: {
                        id_bun: Number(id_bun)
                    },
                    data: {
                        cantitate_disponibila: {
                            decrement: cant_eliberata
                        }
                    }
                });

                // Actualizăm stocul din gestiune
                await tx.stoc.updateMany({
                    where: {
                        id_bun: Number(id_bun),
                        id_gestiune: consum.id_gestiune
                    },
                    data: {
                        stoc_actual: {
                            decrement: cant_eliberata
                        }
                    }
                });

                // Calculăm valoarea liniei
                const valoareLinie = Number(bun.pret_unitar) * Number(cant_eliberata);
                valoareTotala += valoareLinie;

                // Creăm linia de consum
                const linieConsum = await tx.linieConsum.create({
                    data: {
                        id_bun: Number(id_bun),
                        id_consum: consum.id_consum,
                        cantitate_necesara: Number(cantitate_necesara),
                        cant_eliberata: Number(cant_eliberata),
                        valoare: valoareLinie
                    }
                });

                liniiCreated.push(linieConsum);
            }

            // 5. Actualizăm valoarea totală a consumului
            const consumActualizat = await tx.consum.update({
                where: {
                    id_consum: consum.id_consum
                },
                data: {
                    valoare: valoareTotala
                }
            });

            // 6. Returnăm consumul și liniile create
            return NextResponse.json({
                consum: consumActualizat,
                linii: liniiCreated
            }, { status: 201 });
        });

    } catch (error) {
        console.log(error);
        const errorMessage = error instanceof Error ? error.message : "Error creating data";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}