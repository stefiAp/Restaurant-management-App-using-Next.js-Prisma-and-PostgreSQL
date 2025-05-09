'use client'
import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ConsumChart from '../components/ConsumGrafic';
import ConsumTable from '../components/ConsumTable';

// Interfețe pentru modele
interface Angajat {
    id_angajat: number,
    nume_angajat: string,
    prenume_angajat: string,
    functie: string,
    telefon: string,
    email: string,
    data_angajare: Date,
}

interface Gestiune {
    id_gestiune: number,
    denumire: string,
    id_gestionar: number
}

interface Consum {
    id_consum: number,
    valoare: number,
    data: Date,
    id_sef: number,  // Modificat pentru a reflecta structura înainte de JOIN
    id_gestiune: number,  // Modificat pentru a reflecta structura înainte de JOIN
    sef?: Angajat,  // Opțional, dacă relația nu este încărcată
    gestiune?: Gestiune  // Opțional, dacă relația nu este încărcată
}

interface Bun {
    id_bun: number;
    nume_bun: string;
    cantitate_disponibila: number;
    pret_unitar: number;
    data_expirare?: Date;
    unitate_masura: string;
}

interface LinieConsum {
    id_linie_consum: number;
    id_consum: number;
    id_bun: number;
    cantitate_necesara: number;
    valoare: number;
    cant_eliberata: number;
    bun?: Bun;
}

const Page = () => {
    // State pentru datele necesare
    const [liniiConsum, setLiniiConsum] = useState<LinieConsum[]>([]);
    const [bunuri, setBunuri] = useState<Bun[]>([]);
    const [consumuri, setConsumuri] = useState<Consum[]>([]);
    const [angajati, setAngajati] = useState<Angajat[]>([]);
    const [gestiuni, setGestiuni] = useState<Gestiune[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const now = new Date();

    // Funcție pentru a prelua toate datele necesare
    const fetchData = async () => {
        setLoading(true);

        try {
            // Preluăm toate seturile de date în paralel
            const [liniiRes, bunuriRes, consumuriRes, angajatiRes, gestiuniRes] = await Promise.all([
                fetch("http://localhost:3000/api/linie-consum"),
                fetch("http://localhost:3000/api/bun"),
                fetch("http://localhost:3000/api/consum"),
                fetch("http://localhost:3000/api/angajat"),
                fetch("http://localhost:3000/api/gestiune")
            ]);

            if (!liniiRes.ok || !bunuriRes.ok || !consumuriRes.ok || !angajatiRes.ok || !gestiuniRes.ok) {
                throw new Error("Eroare la preluarea datelor");
            }

            const liniiData = await liniiRes.json();
            const bunuriData = await bunuriRes.json();
            const consumuriData = await consumuriRes.json();
            const angajatiData = await angajatiRes.json();
            const gestiuniData = await gestiuniRes.json();

            // Setăm datele în state
            setLiniiConsum(liniiData);
            setBunuri(bunuriData);
            setConsumuri(consumuriData);
            setAngajati(angajatiData);
            setGestiuni(gestiuniData);
        } catch (error) {
            console.error("Eroare:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Procesăm datele de consum pentru a include toate relațiile
    const processedConsumuri = React.useMemo(() => {
        return consumuri.map(consum => {
            // Găsim angajatul (șeful) asociat
            const sef = angajati.find(a => a.id_angajat === consum.id_sef);

            // Găsim gestiunea asociată
            const gestiune = gestiuni.find(g => g.id_gestiune === consum.id_gestiune);

            return {
                ...consum,
                sef: sef || {
                    id_angajat: consum.id_sef,
                    nume_angajat: 'Necunoscut',
                    prenume_angajat: 'Necunoscut',
                    functie: '',
                    telefon: '',
                    email: '',
                    data_angajare: new Date()
                },
                gestiune: gestiune || {
                    id_gestiune: consum.id_gestiune,
                    denumire: 'Necunoscută',
                    id_gestionar: 0
                }
            };
        });
    }, [consumuri, angajati, gestiuni]);

    // Procesăm liniile de consum pentru grafic - asociem bunurile
    const processedLiniiConsum = React.useMemo(() => {
        return liniiConsum.map(linie => {
            // Găsim bunul asociat
            const bun = bunuri.find(b => b.id_bun === linie.id_bun);
            return {
                ...linie,
                bun: bun || {
                    id_bun: linie.id_bun,
                    nume_bun: 'Necunoscut',
                    unitate_masura: '',
                    cantitate_disponibila: 0,
                    pret_unitar: 0
                }
            };
        });
    }, [liniiConsum, bunuri]);

    // Preluăm datele când se încarcă pagina
    useEffect(() => {
        fetchData();
    }, []);

    // Conținut pentru starea de încărcare
    if (loading) {
        return (
            <div className='bg-white flex'>
                <Sidebar />
                <div className='w-4/5 flex flex-col items-center justify-center'>
                    <p className="text-xl">Se încarcă datele...</p>
                </div>
            </div>
        );
    }

    // Conținut pentru starea de eroare
    if (error) {
        return (
            <div className='bg-white flex'>
                <Sidebar />
                <div className='w-4/5 flex flex-col items-center justify-center'>
                    <p className="text-xl text-red-600">A apărut o eroare la încărcarea datelor.</p>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reîncarcă
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white flex '>
            <div className='w-1/4'>
                <Sidebar />
            </div>
            <div className='w-4/5 flex flex-col p-5 text-black'>

                {/* Titlul paginii */}
                <h1 className="text-2xl font-bold mb-2">Gestionare Consum</h1>
                <div className="h-px w-full bg-gray-900 mt-2 mb-4"></div>

                {/* Graficul - ocupă aproximativ 2/3 din înălțime */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Analiză Consum</h2>
                    {processedLiniiConsum.length > 0 ? (
                        <ConsumChart liniiConsum={processedLiniiConsum} />
                    ) : (
                        <p>Nu există date pentru graficul de consum</p>
                    )}
                </div>

                {/* Tabelul - ocupă restul spațiului */}
                <div >
                    <h2 className="text-xl font-semibold mb-4">Lista Consumuri</h2>
                    {processedConsumuri.length > 0 ? (
                        <ConsumTable consum={processedConsumuri} />
                    ) : (
                        <p>Nu există consumuri disponibile</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page