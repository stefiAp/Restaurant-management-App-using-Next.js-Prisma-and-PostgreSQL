import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET() {
   try {
        const angajati = await prisma.angajati.findMany();
        return NextResponse.json(angajati);
    
   } catch (error) {
      console.error("Eroare in preluarea angajatilor:", error);
      return NextResponse.json({ error: "A aparut o eroare la preluarea angajatilor" }, { status: 500 });
    
   } 
}

export async function POST(request: NextRequest){
    try {
        const data = await request.json(); 
        const { nume_angajat, prenume_angajat, email, telefon, functie, data_angajare } = data;

        console.log("Datele primite:", data);
        

        if (!nume_angajat || !prenume_angajat || !functie  || !telefon || !email || !data_angajare) {
            return NextResponse.json({ error: "Toate campurile sunt obligatorii" }, { status: 400 });
        }

        const angajatNou = await prisma.angajati.create({
            data: {
                nume_angajat,
                prenume_angajat,
                functie,
                telefon,
                email,
                data_angajare
            }
        });

        console.log("Angajatul a fost adaugat cu succes!");
        return NextResponse.json(angajatNou, { status: 201 });
        
    } catch (error) {
        console.error("Eroare in adaugarea angajatului:", error);
        return NextResponse.json({ error: "A aparut o eroare la adaugarea angajatului" }, { status: 500 });
        
    }
}