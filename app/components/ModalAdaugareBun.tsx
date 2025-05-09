// components/ModalAdaugareBun.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Package2, ShoppingCart, Loader2, Check, ChevronDown, AlertCircle, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Bun {
    id_linie_cerere?: number;
    id_bun: number;
    nume_bun: string;
    cantitate: number;
    pret_unitar?: number | string;
    unitate_masura?: string;
    observatii?: string;
}

interface ModalAdaugareBunProps {
    editingBun: Bun | null; // Bun pentru editare (null pentru adăugare)
    onClose: () => void;
    onAdd: (bun: Bun) => void;
}

const ModalAdaugareBun: React.FC<ModalAdaugareBunProps> = ({
    editingBun,
    onClose,
    onAdd
}) => {
    // State
    const [bunuri, setBunuri] = useState<any[]>([]);
    const [bunSelectat, setBunSelectat] = useState<number | null>(null);
    const [cantitate, setCantitate] = useState<string>('');
    const [observatii, setObservatii] = useState<string>('Cerere automată din consum');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Animation states
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBunDetails, setSelectedBunDetails] = useState<any>(null);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [animatePriceField, setAnimatePriceField] = useState(false);
    const [animateValue, setAnimateValue] = useState(false);

    // Animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setModalVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Încărcăm bunurile disponibile
    useEffect(() => {
        const fetchBunuri = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/bun');
                if (res.ok) {
                    const data = await res.json();
                    setBunuri(data);
                } else {
                    console.error('Eroare la încărcarea bunurilor');
                }
            } catch (error) {
                console.error('Eroare:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBunuri();
    }, []);

    // Populăm formularul cu datele bunului editat
    useEffect(() => {
        if (editingBun) {
            setBunSelectat(editingBun.id_bun);
            setCantitate(editingBun.cantitate.toString());
            if (editingBun.observatii) {
                setObservatii(editingBun.observatii);
            }
        }
    }, [editingBun]);

    // Update selectedBunDetails when bunSelectat changes
    useEffect(() => {
        if (bunSelectat) {
            const bun = bunuri.find(b => b.id_bun === bunSelectat);
            if (bun) {
                setSelectedBunDetails(bun);
                // Animate price field when product is selected
                setAnimatePriceField(true);
                setTimeout(() => setAnimatePriceField(false), 600);
            }
        } else {
            setSelectedBunDetails(null);
        }
    }, [bunSelectat, bunuri]);

    // Animate value calculation when quantity changes
    useEffect(() => {
        if (cantitate && bunSelectat) {
            setAnimateValue(true);
            setTimeout(() => setAnimateValue(false), 600);
        }
    }, [cantitate, bunSelectat]);

    // Format numbers for display
    const formatNumber = (val: any): string => {
        if (val === null || val === undefined) return '0.00';
        const num = typeof val === 'number' ? val : parseFloat(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const handleAdd = () => {
        if (!bunSelectat || !cantitate || !observatii) {
            toast.error('Vă rugăm completați toate câmpurile obligatorii!');
            return;
        }

        const cantitateNumerica = parseFloat(cantitate);
        if (isNaN(cantitateNumerica) || cantitateNumerica <= 0) {
            toast.error('Vă rugăm introduceți o cantitate validă!');
            return;
        }

        const bun = bunuri.find(b => b.id_bun === bunSelectat);
        if (!bun) return;

        setSubmitting(true);
        const toastId = toast.loading(editingBun ? 'Se actualizează produsul...' : 'Se adaugă produsul...');
        // Simulate a short delay to show loading state
        setTimeout(() => {
            onAdd({
                id_linie_cerere: editingBun?.id_linie_cerere,
                id_bun: bun.id_bun,
                nume_bun: bun.nume_bun,
                cantitate: cantitateNumerica,
                pret_unitar: bun.pret_unitar,
                unitate_masura: bun.unitate_masura,
                observatii: observatii
            });
            toast.success(
                editingBun
                    ? `Produsul "${bun.nume_bun}" a fost actualizat`
                    : `Produsul "${bun.nume_bun}" a fost adăugat`,
                { id: toastId }
            );
            setSubmitting(false);
        }, 300);


    };

    // Filtered products for search
    const filteredBunuri = searchTerm
        ? bunuri.filter(bun =>
            bun.nume_bun.toLowerCase().includes(searchTerm.toLowerCase()))
        : bunuri;

    // Calculate value based on quantity and price
    const calculateValue = () => {
        if (!bunSelectat || !cantitate) return 0;

        const bun = bunuri.find(b => b.id_bun === bunSelectat);
        if (!bun) return 0;

        const pretUnitar = typeof bun.pret_unitar === 'number'
            ? bun.pret_unitar
            : parseFloat(bun.pret_unitar?.toString() || '0');

        const cantitateNumerica = parseFloat(cantitate);

        return isNaN(pretUnitar) || isNaN(cantitateNumerica)
            ? 0
            : pretUnitar * cantitateNumerica;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div
                className={`bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ${modalVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-black text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                            <Package2 className="text-gray-800" size={18} />
                        </div>
                        <h2 className="text-xl font-serif">
                            {editingBun ? 'Editare produs' : 'Adăugare produs nou'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-red-600 p-1 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Product selection */}
                    <div className="mb-5">
                        <label className=" text-gray-700 font-medium mb-2 flex items-center gap-1">
                            <ShoppingCart size={16} className="text-gray-500" />
                            Produs:
                        </label>
                        <div className="relative">
                            <div
                                className={`border rounded-lg ${editingBun ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
                                    } flex justify-between items-center p-2.5 ${dropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
                                    }`}
                                onClick={() => !editingBun && setDropdownOpen(!dropdownOpen)}
                            >
                                {bunSelectat ? (
                                    <span className="font-medium text-gray-800">
                                        {bunuri.find(b => b.id_bun === bunSelectat)?.nume_bun}
                                    </span>
                                ) : (
                                    <span className="text-gray-500">Selectați un produs</span>
                                )}

                                {!editingBun && (
                                    <ChevronDown
                                        size={18}
                                        className={`text-gray-500 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''
                                            }`}
                                    />
                                )}
                            </div>

                            {/* Dropdown */}
                            {dropdownOpen && !editingBun && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-56 overflow-y-auto">
                                    <div className="p-2 border-b sticky top-0 bg-white z-20 shadow-sm">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Caută produse..."
                                                className="w-full p-2 pl-8 border border-gray-300 rounded"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center p-4 text-gray-500">
                                            <Loader2 className="animate-spin mr-2" size={18} />
                                            <span>Se încarcă produsele...</span>
                                        </div>
                                    ) : filteredBunuri.length > 0 ? (
                                        <ul className="py-1">
                                            {filteredBunuri.map((bun) => (
                                                <li
                                                    key={bun.id_bun}
                                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-100"
                                                    onClick={() => {
                                                        setBunSelectat(bun.id_bun);
                                                        setDropdownOpen(false);
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium group-hover:text-blue-600 transition-colors">{bun.nume_bun}</span>
                                                        <span className="text-gray-500 text-sm bg-gray-100 px-2 py-0.5 rounded group-hover:bg-blue-100">
                                                            {bun.unitate_masura}
                                                        </span>
                                                    </div>
                                                    {bun.cantitate_disponibila && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Disponibil: {formatNumber(bun.cantitate_disponibila)} {bun.unitate_masura}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            Nu s-au găsit produse care să corespundă căutării
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product details card */}
                    {selectedBunDetails && (
                        <div className={`mb-5 bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${animatePriceField ? 'animate-pulse shadow-md' : 'shadow-sm'
                            }`}>
                            <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
                                <FileText size={14} />
                                Detalii produs
                            </div>
                            <div className="grid grid-cols-2 gap-0.5 p-0.5">
                                <div className="bg-gray-50 p-3">
                                    <div className="text-xs text-gray-500 mb-1">Preț unitar</div>
                                    <div className="font-medium text-gray-800">
                                        {formatNumber(selectedBunDetails.pret_unitar)} lei
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3">
                                    <div className="text-xs text-gray-500 mb-1">Unitate de măsură</div>
                                    <div className="font-medium text-gray-800">
                                        {selectedBunDetails.unitate_masura || '-'}
                                    </div>
                                </div>
                                {selectedBunDetails.cantitate_disponibila !== undefined && (
                                    <div className="bg-gray-50 p-3 col-span-2">
                                        <div className="text-xs text-gray-500 mb-1">Cantitate disponibilă</div>
                                        <div className="font-medium text-gray-800">
                                            {formatNumber(selectedBunDetails.cantitate_disponibila)} {selectedBunDetails.unitate_masura}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quantity field */}
                    <div className="mb-4">
                        <label className=" text-gray-700 font-medium mb-2 flex items-center gap-1">
                            <Package2 size={16} className="text-gray-500" />
                            Cantitate:
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={cantitate}
                                onChange={(e) => setCantitate(e.target.value)}
                                min="0.01"
                                step="0.01"
                                placeholder="Introduceți cantitatea dorită"
                            />
                            {selectedBunDetails?.unitate_masura && (
                                <div className="absolute right-3 top-2.5 text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-sm">
                                    {selectedBunDetails.unitate_masura}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Value calculation */}
                    {bunSelectat && cantitate && selectedBunDetails?.pret_unitar && (
                        <div className={`mb-4 flex justify-between p-3 rounded-lg border transition-all duration-300 ${animateValue
                            ? 'bg-blue-100 border-blue-300 shadow'
                            : 'bg-blue-50 border-blue-100'
                            }`}>
                            <span className="font-medium text-gray-700 flex items-center gap-1">
                                <AlertCircle size={16} className="text-blue-500" />
                                Valoare estimată:
                            </span>
                            <span className="font-medium text-blue-700">{formatNumber(calculateValue())} lei</span>
                        </div>
                    )}

                    {/* Observations field */}
                    <div className="mb-6">
                        <label className=" text-gray-700 font-medium mb-2 flex items-center gap-1">
                            <FileText size={16} className="text-gray-500" />
                            Observații:
                        </label>
                        <textarea
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={observatii}
                            onChange={(e) => setObservatii(e.target.value)}
                            rows={3}
                            placeholder="Detalii suplimentare despre cerere"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between pt-2">
                        <button
                            onClick={onClose}
                            onMouseEnter={() => setHoveredButton('cancel')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className={`bg-red-600 text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all ${hoveredButton === 'cancel' ? 'bg-red-700 shadow-md' : ''
                                }`}
                            disabled={submitting}
                        >
                            <X size={18} />
                            Renunță
                        </button>

                        <button
                            onClick={handleAdd}
                            onMouseEnter={() => setHoveredButton('save')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className={`bg-black text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all ${hoveredButton === 'save' ? 'bg-gray-800 shadow-md' : ''
                                } ${(!bunSelectat || !cantitate || !observatii) ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            disabled={!bunSelectat || !cantitate || !observatii || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Salvare...
                                </>
                            ) : editingBun ? (
                                <>
                                    <Save size={18} />
                                    Salvează
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Adaugă
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* CSS for custom animations */}
                <style jsx>{`
                    @keyframes pulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.6; }
                    }
                    .animate-pulse {
                      animation: pulse 0.6s ease-in-out;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ModalAdaugareBun;