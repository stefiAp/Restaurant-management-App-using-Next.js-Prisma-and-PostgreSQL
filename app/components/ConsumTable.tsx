import Link from 'next/link'
import React, { useState } from 'react'
import { Plus, ArrowUp, ArrowDown, FileText, User, Building, Calendar, DollarSign, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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
    sef: Angajat,
    gestiune: Gestiune
}

interface ConsumTableProps {
    consum: Consum[]
}

const ConsumTable: React.FC<ConsumTableProps> = ({ consum }) => {
    const router = useRouter();

    // State pentru sortare și interfață
    const [sortField, setSortField] = useState<keyof Consum>('id_consum');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Funcție pentru formatarea datei
    const formatDate = (dateInput: Date | string): string => {
        // Verificăm dacă input-ul este deja un obiect Date
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

        // Verificăm dacă data rezultată este validă
        if (isNaN(date.getTime())) {
            return 'Data invalidă';
        }

        // Formatăm data
        return date.toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Funcție pentru formatarea valorii cu simbolul monedei
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Funcție pentru sortarea datelor
    const sortData = (data: Consum[]): Consum[] => {
        return [...data].sort((a, b) => {
            let compareValueA;
            let compareValueB;

            // Extragem valorile pentru comparație în funcție de câmpul de sortare
            switch (sortField) {
                case 'data':
                    compareValueA = new Date(a.data).getTime();
                    compareValueB = new Date(b.data).getTime();
                    break;
                case 'valoare':
                    compareValueA = a.valoare;
                    compareValueB = b.valoare;
                    break;
                case 'id_consum':
                default:
                    compareValueA = a.id_consum;
                    compareValueB = b.id_consum;
                    break;
            }

            // Sortăm în funcție de direcție
            if (sortDirection === 'asc') {
                return compareValueA > compareValueB ? 1 : -1;
            } else {
                return compareValueA < compareValueB ? 1 : -1;
            }
        });
    };

    // Funcție pentru schimbarea sortării
    const handleSort = (field: keyof Consum) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Funcție pentru vizualizarea detaliată a consumului
    const viewConsum = (id: number) => {
        router.push(`/consum/${id}`);
    };

    // Funcție pentru editarea consumului
    const editConsum = (id: number) => {
        router.push(`/consum/editare/${id}`);
    };

    // Funcție pentru ștergerea consumului
    const deleteConsum = async (id: number) => {
        // Afișăm un toast pentru confirmare
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-medium">Confirmați ștergerea consumului #{id}?</p>
                    <p className="text-sm">Această acțiune este ireversibilă.</p>
                    <div className="flex justify-between mt-2">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm transition-colors"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            Anulare
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                            onClick={() => {
                                toast.dismiss(t.id);
                                performDelete(id);
                            }}
                        >
                            Confirmă
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 10000, // Durată mai lungă pentru a permite utilizatorului să decidă
                position: 'top-center',
                style: {
                    maxWidth: '320px',
                    padding: '16px',
                    borderRadius: '8px',
                },
            }
        );
    };

    // Implementarea efectivă a ștergerii
    const performDelete = async (id: number) => {
        setIsDeleting(true);

        try {
            const toastId = toast.loading(`Se șterge consumul #${id}...`);

            // Aici ar veni apelul către API pentru ștergere
            const response = await fetch(`/api/consum/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Eroare la ștergerea consumului');
            }

            // Afișăm notificare de succes
            toast.success('Consumul a fost șters cu succes!', { id: toastId });

            // Alternativ - reîncărcați datele sau eliminați elementul din state local

        } catch (error) {
            console.error('Eroare la ștergerea consumului:', error);
            toast.error('A apărut o eroare la ștergerea consumului.');
        } finally {
            setIsDeleting(false);
            setActiveDropdown(null);
        }
    };

    // Sortăm datele
    const sortedData = sortData(consum);

    // Determinăm culoarea pentru valoare (verde pentru valori mici, galben pentru medii, roșu pentru mari)
    const getValueColor = (value: number): string => {
        // Găsim valorile min și max
        const values = consum.map(c => c.valoare);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;

        // Calculăm procentul din interval
        const percent = range === 0 ? 0 : ((value - minValue) / range) * 100;

        if (percent < 33) return 'text-green-500';
        if (percent < 66) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-black p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Tabel de consumuri</h3>
                </div>
                <div>
                    <Link
                        href="/consum/creare"
                        className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Adaugă consum nou
                    </Link>
                </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm">
                            <th
                                className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('id_consum')}
                            >
                                <div className="flex items-center gap-1">
                                    Număr
                                    {sortField === 'id_consum' && (
                                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('data')}
                            >
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-gray-500" />
                                    Data consum
                                    {sortField === 'data' && (
                                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('valoare')}
                            >
                                <div className="flex items-center gap-1">
                                    <DollarSign size={14} className="text-gray-500" />
                                    Valoare
                                    {sortField === 'valoare' && (
                                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                                <div className="flex items-center gap-1">
                                    <User size={14} className="text-gray-500" />
                                    Responsabil
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left font-medium">
                                <div className="flex items-center gap-1">
                                    <Building size={14} className="text-gray-500" />
                                    Gestiune
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center font-medium">
                                Acțiuni
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedData.map((c, index) => (
                            <tr
                                key={c.id_consum}
                                className={`hover:bg-blue-50 transition-colors ${hoveredRow === index ? 'bg-blue-50' : 'bg-white'
                                    }`}
                                onMouseEnter={() => setHoveredRow(index)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-medium text-gray-900">#{c.id_consum}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="text-gray-700">{formatDate(c.data)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`font-bold ${getValueColor(c.valoare)}`}>
                                        {formatCurrency(c.valoare)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                                            {c.sef.nume_angajat.charAt(0)}{c.sef.prenume_angajat.charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {`${c.sef.nume_angajat} ${c.sef.prenume_angajat}`}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {c.sef.functie}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-sm font-medium bg-gray-100 rounded-md text-gray-800">
                                        {c.gestiune.denumire}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end items-center space-x-2">
                                        {/* Buton vizualizare */}
                                        <button
                                            onClick={() => viewConsum(c.id_consum)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition-colors"
                                            title="Vizualizare"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {/* Buton editare */}
                                        <button
                                            onClick={() => editConsum(c.id_consum)}
                                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full transition-colors"
                                            title="Editare"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        {/* Buton ștergere */}
                                        <button
                                            onClick={() => deleteConsum(c.id_consum)}
                                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors"
                                            title="Ștergere"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* Alternativ: dropdown cu acțiuni */}
                                        <div className="relative inline-block text-left">
                                            <button
                                                className="p-2 rounded-full text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                                                onClick={() => setActiveDropdown(activeDropdown === c.id_consum ? null : c.id_consum)}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {activeDropdown === c.id_consum && (
                                                <div
                                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                                    onMouseLeave={() => setActiveDropdown(null)}
                                                >
                                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                                        <button
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            onClick={() => viewConsum(c.id_consum)}
                                                        >
                                                            <Eye size={16} className="mr-2" />
                                                            Vizualizare
                                                        </button>
                                                        <button
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            onClick={() => editConsum(c.id_consum)}
                                                        >
                                                            <Edit size={16} className="mr-2" />
                                                            Editare
                                                        </button>
                                                        <button
                                                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                            onClick={() => deleteConsum(c.id_consum)}
                                                            disabled={isDeleting}
                                                        >
                                                            <Trash2 size={16} className="mr-2" />
                                                            Ștergere
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sortedData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    Nu există consumuri disponibile
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer cu paginare sau sumar */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                        Afișare <span className="font-medium">{sortedData.length}</span> consumuri
                    </span>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-2">
                            Valoare totală:
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(sortedData.reduce((sum, c) => Number(sum) + Number(c.valoare), 0))}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConsumTable