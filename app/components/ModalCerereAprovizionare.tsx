// components/ModalCerereAprovizionare.tsx
import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus, ShoppingCart, Package2, FileDown, FilePlus, Loader2 } from 'lucide-react';
import ModalAdaugareBun from './ModalAdaugareBun';
import toast from 'react-hot-toast';

interface Bun {
    id_linie_cerere?: number; // ID-ul pentru linia cererii (pentru actualizare/ștergere)
    id_bun: number;
    nume_bun: string;
    cantitate: number;
    observatii?: string;
    um?: string;
    pret_unitar?: number | string;
}

interface ModalCerereAprovizionareProps {
    bunInitial: {
        id_bun: number;
        nume_bun: string;
        cantitate_necesara: number | string;
    };
    idCerere?: number; // ID-ul cererii de aprovizionare (dacă există)
    onClose: () => void;
    onSave: (linii: Bun[]) => void;
}

const ModalCerereAprovizionare: React.FC<ModalCerereAprovizionareProps> = ({
    bunInitial,
    idCerere,
    onClose,
    onSave
}) => {
    const [linii, setLinii] = useState<Bun[]>([
        {
            id_bun: bunInitial.id_bun,
            nume_bun: bunInitial.nume_bun,
            cantitate: Number(bunInitial.cantitate_necesara) || 5, // Valoare implicită sau valoarea necesară
            observatii: 'Cerere automată din consum'
        }
    ]);

    const [modalAdaugareBunVisible, setModalAdaugareBunVisible] = useState(false);
    const [editingBun, setEditingBun] = useState<Bun | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    // Animation and hover states
    const [fadeIn, setFadeIn] = useState(false);
    const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    // Animate entry
    useEffect(() => {
        const timer = setTimeout(() => setFadeIn(true), 50);
        const timer2 = setTimeout(() => setModalVisible(true), 150);
        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, []);

    // Dacă avem un ID de cerere, încărcăm liniile existente
    useEffect(() => {
        if (idCerere) {
            fetchLiniiCerere(idCerere);
        }
    }, [idCerere]);

    // Format numbers for display
    const formatNumber = (val: any): string => {
        const num = typeof val === 'number' ? val : parseFloat(val);
        return isNaN(num) ? '0' : num.toFixed(2);
    };

    // Funcție pentru încărcarea liniilor unei cereri existente
    const fetchLiniiCerere = async (id: number) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/linie-cerere-aprovizionare?id_cerere=${id}`);

            if (res.ok) {
                const data = await res.json();
                console.log('Datele primite:', data); // Pentru debugging

                // Procesăm datele și ne asigurăm că avem toate informațiile necesare
                const liniiProcesate = data.map((linie: any) => {
                    // Ne asigurăm că avem toate informațiile despre bun
                    if (!linie.bun) {
                        console.warn(`Linia ${linie.id} nu are informații despre bun`);
                    }

                    return {
                        id_linie_cerere: linie.id,
                        id_bun: linie.id_bun,
                        nume_bun: linie.bun?.nume_bun || 'Necunoscut',
                        cantitate: linie.cantitate,
                        observatii: linie.observatii || 'Cerere automată din consum',
                        um: linie.bun?.unitate_masura || '-',
                        pret_unitar: linie.bun?.pret_unitar || 0
                    };
                });

                setLinii(liniiProcesate);
            } else {
                console.error('Eroare la încărcarea liniilor cererii');
                toast.error('Eroare la încărcarea liniilor cererii');
            }
        } catch (error) {
            console.error('Eroare:', error);
            toast.error('A apărut o eroare la încărcarea datelor');
        } finally {
            setIsLoading(false);
        }
    };

    // Funcție pentru deschiderea modalului de adăugare
    const adaugaBun = () => {
        setEditingBun(null); // Asigurăm că nu suntem în modul de editare
        setModalAdaugareBunVisible(true);
    };

    // Funcție pentru editarea unui bun
    const editBun = (bun: Bun) => {
        setEditingBun(bun);
        setModalAdaugareBunVisible(true);
    };

    // Funcție pentru salvarea unui bun (nou sau editat)
    const handleSaveBun = async (bun: Bun) => {
        const actionType = editingBun ? 'save' : 'add';
        setActionInProgress(actionType);

        if (editingBun && editingBun.id_linie_cerere && idCerere) {
            // Actualizăm un bun existent în API
            try {
                toast.loading('Se actualizează bunul...');
                const res = await fetch(`/api/linie-cerere-aprovizionare/${editingBun.id_linie_cerere}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_cerere: idCerere,
                        id_bun: bun.id_bun,
                        cantitate: bun.cantitate,
                        observatii: bun.observatii || 'Cerere automată din consum'
                    }),
                });

                if (!res.ok) {
                    throw new Error('Eroare la actualizarea bunului');
                }

                // Actualizăm lista de linii
                setLinii(linii.map(l =>
                    l.id_linie_cerere === editingBun.id_linie_cerere
                        ? { ...bun, id_linie_cerere: editingBun.id_linie_cerere }
                        : l
                ));
                toast.success('Bunul a fost actualizat cu succes!');
            } catch (error) {
                console.error('Eroare la actualizarea bunului:', error);
                toast.error('A apărut o eroare la actualizarea bunului');
            } finally {
                setActionInProgress(null);
            }
        } else {
            // Adăugăm un bun nou
            if (idCerere) {
                // Dacă avem o cerere existentă, adăugăm bunul direct în API
                try {
                    toast.loading('Se actualizează bunul...');
                    const res = await fetch('/api/linie-cerere-aprovizionare', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id_cerere: idCerere,
                            id_bun: bun.id_bun,
                            cantitate: bun.cantitate,
                            observatii: bun.observatii || 'Cerere automată din consum'
                        }),
                    });

                    if (!res.ok) {
                        throw new Error('Eroare la adăugarea bunului');
                    }

                    const linieCreata = await res.json();

                    // Adăugăm linia nouă la listă
                    setLinii([...linii, {
                        ...bun,
                        id_linie_cerere: linieCreata.id
                    }]);
                    toast.success('Bunul a fost actualizat cu succes!');
                } catch (error) {
                    console.error('Eroare la adăugarea bunului:', error);
                    toast.error('A apărut o eroare la actualizarea bunului');
                } finally {
                    setActionInProgress(null);
                }
            } else {
                // Dacă nu avem încă o cerere, adăugăm bunul doar în state
                setLinii([...linii, bun]);
                setActionInProgress(null);
            }
        }

        setModalAdaugareBunVisible(false);
        setEditingBun(null);
    };

    // Funcție pentru ștergerea unui bun
    const stergeBun = async (bun: Bun) => {
        if (!window.confirm(`Sigur doriți să ștergeți bunul ${bun.nume_bun}?`)) {
            return;
        }

        setActionInProgress('delete');

        if (bun.id_linie_cerere && idCerere) {
            // Ștergem bunul din API
            try {
                const res = await fetch(`/api/linie-cerere-aprovizionare/${bun.id_linie_cerere}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    throw new Error('Eroare la ștergerea bunului');
                }

                // Eliminăm bunul din listă
                setLinii(linii.filter(l => l.id_linie_cerere !== bun.id_linie_cerere));
                toast.success(`Bunul "${bun.nume_bun}" a fost șters cu succes!`);
            } catch (error) {
                console.error('Eroare la ștergerea bunului:', error);
                toast.error('A apărut o eroare la stergerea bunului');
            } finally {
                setActionInProgress(null);
            }
        } else {
            // Eliminăm bunul doar din state
            setLinii(linii.filter(l => l !== bun));
            setActionInProgress(null);
        }
    };

    const getValoareTotala = () => {
        return linii.reduce((total, linie) => {
            const cantitate = typeof linie.cantitate === 'number' ? linie.cantitate : parseFloat(linie.cantitate);
            const pretUnitar = typeof linie.pret_unitar === 'number'
                ? linie.pret_unitar
                : (linie.pret_unitar ? parseFloat(linie.pret_unitar.toString()) : 0);

            return total + (cantitate * pretUnitar);
        }, 0);
    };

    const handleOnSave = () => {
        setActionInProgress('saving');
        setTimeout(() => {
            onSave(linii);
            setActionInProgress(null);
        }, 500); // Simulate a short delay to show loading state
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-gray-100 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 ${modalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {/* Header */}
                <div className="bg-black text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                            <ShoppingCart className="text-black" size={22} />
                        </div>
                        <h2 className="text-2xl font-serif">Cerere de aprovizionare</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-red-600 p-1 rounded-full transition-colors duration-200"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Status info when there's an existing request */}
                    {idCerere && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-5 flex items-center gap-3">
                            <div className="bg-blue-500 p-2 rounded-full text-white">
                                <FileDown size={18} />
                            </div>
                            <div>
                                <p className="text-blue-700 font-medium">Cerere existentă: #{idCerere}</p>
                                <p className="text-sm text-blue-600">Această cerere este în așteptare pentru aprobare</p>
                            </div>
                        </div>
                    )}

                    {/* Bunuri section */}
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden mb-5">
                        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Package2 size={18} />
                                <h3 className="text-lg font-serif">Bunuri solicitate</h3>
                            </div>
                            <button
                                onClick={adaugaBun}
                                onMouseEnter={() => setHoveredButton('add')}
                                onMouseLeave={() => setHoveredButton(null)}
                                className={`bg-white text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-all ${hoveredButton === 'add' ? 'bg-gray-100 shadow-md' : ''
                                    }`}
                                disabled={actionInProgress !== null}
                            >
                                <Plus size={16} /> Adaugă bun
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                <Loader2 className="animate-spin mb-4" size={32} />
                                <p>Se încarcă datele...</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 border-b">
                                                <th className="px-4 py-3 text-left font-serif text-gray-800">Denumire bun</th>
                                                <th className="px-4 py-3 text-center font-serif text-gray-800">UM</th>
                                                <th className="px-4 py-3 text-right font-serif text-gray-800">Cantitate</th>
                                                <th className="px-4 py-3 text-center font-serif text-gray-800">Acțiuni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {linii.map((linie, index) => (
                                                <tr
                                                    key={linie.id_linie_cerere || index}
                                                    onMouseEnter={() => setHoveredRowIndex(index)}
                                                    onMouseLeave={() => setHoveredRowIndex(null)}
                                                    className={`border-b border-gray-200 transition-colors ${hoveredRowIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-800">{linie.nume_bun}</div>
                                                        {linie.observatii && (
                                                            <div className="text-xs text-gray-500 mt-1 italic">
                                                                {linie.observatii}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{linie.um || '-'}</td>
                                                    <td className="px-4 py-3 text-right font-medium">{formatNumber(linie.cantitate)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                className="p-1.5 rounded-full text-white bg-cyan-500 hover:bg-cyan-600 transition-colors shadow-sm"
                                                                onClick={() => editBun(linie)}
                                                                title="Editează"
                                                                disabled={actionInProgress !== null}
                                                            >
                                                                <Edit size={15} />
                                                            </button>
                                                            <button
                                                                className="p-1.5 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                                                                onClick={() => stergeBun(linie)}
                                                                title="Șterge"
                                                                disabled={actionInProgress !== null}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {linii.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                        <FilePlus className="mx-auto mb-2" size={24} />
                                                        <p>Nu există bunuri adăugate.</p>
                                                        <p className="text-sm mt-1">Folosiți butonul "Adaugă bun" pentru a adăuga.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary section */}
                                {linii.length > 0 && (
                                    <div className="bg-gray-100 p-3 flex justify-between items-center border-t">
                                        <div className="font-medium text-gray-700">
                                            Total produse: <span className="text-gray-900">{linii.length}</span>
                                        </div>
                                        {linii.some(l => l.pret_unitar) && (
                                            <div className="font-medium text-gray-700">
                                                Valoare estimată: <span className="text-gray-900">{formatNumber(getValoareTotala())} lei</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={onClose}
                            onMouseEnter={() => setHoveredButton('cancel')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className={`bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all ${hoveredButton === 'cancel' ? 'bg-red-700' : ''
                                }`}
                            disabled={actionInProgress !== null}
                        >
                            <X size={18} />
                            Renunță
                        </button>

                        <button
                            onClick={handleOnSave}
                            onMouseEnter={() => setHoveredButton('save')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className={`bg-black text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all ${hoveredButton === 'save' ? 'bg-gray-800 shadow-lg' : ''
                                }`}
                            disabled={actionInProgress !== null}
                        >
                            {actionInProgress === 'saving' ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Salvare...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={18} />
                                    {idCerere ? 'Salvează' : 'Creează cerere'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal pentru adăugare/editare bun */}
            {modalAdaugareBunVisible && (
                <ModalAdaugareBun
                    editingBun={editingBun}
                    onClose={() => {
                        setModalAdaugareBunVisible(false);
                        setEditingBun(null);
                    }}
                    onAdd={handleSaveBun}
                />
            )}
        </div>
    );
};

export default ModalCerereAprovizionare;