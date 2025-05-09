// components/ConsumAlertaCantitateInsuficienta.tsx
import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, ShoppingCart } from 'lucide-react';

interface AlertaCantitateInsuficientaProps {
    bun: {
        id_bun: number;
        nume_bun: string;
        cantitate_disponibila: number | string;
        cantitate_necesara: number | string;
    };
    onConfirm: () => void;
    onCancel: () => void;
}

const ConsumAlertaCantitateInsuficienta: React.FC<AlertaCantitateInsuficientaProps> = ({
    bun,
    onConfirm,
    onCancel
}) => {
    // Animation states
    const [isVisible, setIsVisible] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    // Format numbers for display
    const formatNumber = (val: number | string): string => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? '0' : num.toFixed(2);
    };

    // Calculate deficit amount
    const getDeficit = (): string => {
        const available = typeof bun.cantitate_disponibila === 'string'
            ? parseFloat(bun.cantitate_disponibila)
            : bun.cantitate_disponibila;

        const needed = typeof bun.cantitate_necesara === 'string'
            ? parseFloat(bun.cantitate_necesara)
            : bun.cantitate_necesara;

        return formatNumber(needed - available);
    };

    // Animate entry
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Handle shake animation for attention
    useEffect(() => {
        const timer = setTimeout(() => setIsShaking(true), 300);
        const endTimer = setTimeout(() => setIsShaking(false), 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(endTimer);
        };
    }, []);

    // Handle button hover effects
    const [hoverCancel, setHoverCancel] = useState(false);
    const [hoverConfirm, setHoverConfirm] = useState(false);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                className={`bg-white p-0 rounded-lg max-w-md shadow-xl transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    } ${isShaking ? 'animate-shake' : ''}`}
                style={{
                    animation: isShaking ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none'
                }}
            >
                {/* Header with warning icon */}
                <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center gap-3">
                    <div className="bg-white rounded-full p-2 flex-shrink-0">
                        <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <h2 className="text-xl font-serif font-bold">
                        Cantitate insuficientă pe stoc!
                    </h2>
                </div>

                {/* Content area */}
                <div className="p-6">
                    <div className="mb-5 bg-red-50 p-4 rounded-md border border-red-200">
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="bg-gray-800 text-white p-2 rounded-tl-md font-serif">
                                Produs
                            </div>
                            <div className="bg-gray-800 text-white p-2 font-serif">
                                Disponibil
                            </div>
                            <div className="bg-gray-800 text-white p-2 rounded-tr-md font-serif">
                                Solicitat
                            </div>

                            <div className="bg-white p-2 border border-gray-300 rounded-bl-md">
                                <span className="font-medium">{bun.nume_bun}</span>
                            </div>
                            <div className="bg-white p-2 border border-gray-300 text-red-600 font-bold">
                                {formatNumber(bun.cantitate_disponibila)}
                            </div>
                            <div className="bg-white p-2 border border-gray-300 rounded-br-md font-bold">
                                {formatNumber(bun.cantitate_necesara)}
                            </div>
                        </div>

                        <div className="bg-red-100 p-3 rounded flex items-center gap-2 text-red-800">
                            <span className="font-bold">Deficit:</span> {getDeficit()} unități
                        </div>
                    </div>

                    <p className="mb-6 text-gray-700">
                        Doriți să faceți o cerere de aprovizionare pentru acest produs? Confirmați pentru a crea cererea sau anulați pentru a modifica cantitatea solicitată.
                    </p>

                    {/* Action buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={onCancel}
                            onMouseEnter={() => setHoverCancel(true)}
                            onMouseLeave={() => setHoverCancel(false)}
                            className={`bg-red-600 text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all ${hoverCancel ? 'bg-red-700 shadow-md' : ''
                                }`}
                        >
                            <X size={20} />
                            Anulează
                        </button>

                        <button
                            onClick={onConfirm}
                            onMouseEnter={() => setHoverConfirm(true)}
                            onMouseLeave={() => setHoverConfirm(false)}
                            className={`bg-black text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all ${hoverConfirm ? 'bg-gray-800 shadow-md' : ''
                                }`}
                        >
                            <ShoppingCart size={20} />
                            Cerere aprovizionare
                        </button>
                    </div>
                </div>
            </div>

            {/* Add CSS for shake animation */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};

export default ConsumAlertaCantitateInsuficienta;