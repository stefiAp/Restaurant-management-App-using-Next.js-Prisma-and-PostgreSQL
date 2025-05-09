import React, { useMemo } from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

// Definim interfețele pentru modelele tale
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
    bun: Bun;
}

interface ConsumChartProps {
    liniiConsum: LinieConsum[];
}

const ConsumChart: React.FC<ConsumChartProps> = ({ liniiConsum }) => {
    // Array de culori atractive pentru grafice
    const colorPalette = [
        '#FF6384', // roz
        '#36A2EB', // albastru
        '#FFCE56', // galben
        '#4BC0C0', // turcoaz
        '#9966FF', // mov
        '#FF9F40', // portocaliu
        '#C9CBCF', // gri
        '#7BC043', // verde
        '#F37736', // portocaliu întunecat
        '#FFC857', // galben deschis
        '#41B3A3', // verde mentă
        '#E27D60', // coral
        '#85DCBA', // verde pal
        '#E8A87C', // piersică
        '#C38D9E', // roz închis
        '#8D8741', // olive
        '#659DBD', // albastru deschis
        '#DAAD86', // bej
        '#BC986A', // maro deschis
        '#FBEEC1'  // crem
    ];

    // Procesarea datelor pentru grafic
    const processDataForChart = () => {
        const groupedData: Record<string, number> = {};

        liniiConsum.forEach(linie => {
            const numeBun = linie.bun.nume_bun;

            if (groupedData[numeBun]) {
                groupedData[numeBun] += Number(linie.cant_eliberata);
            } else {
                groupedData[numeBun] = Number(linie.cant_eliberata);
            }
        });

        return Object.keys(groupedData).map(key => ({
            name: key,
            cantitate: groupedData[key]
        }));
    };

    const chartData = processDataForChart();

    // Asignăm culori din paletă pentru fiecare bun
    const bunColorMap = useMemo(() => {
        const colorMap: Record<string, string> = {};
        const uniqueBunNames = [...new Set(chartData.map(item => item.name))];

        // Amestecăm array-ul de culori pentru a obține o distribuție aleatorie
        const shuffledColors = [...colorPalette].sort(() => Math.random() - 0.5);

        uniqueBunNames.forEach((name, index) => {
            colorMap[name] = shuffledColors[index % shuffledColors.length];
        });

        return colorMap;
    }, [chartData]);

    // Calculăm valorile pentru linia de tendință
    const dataWithTrend = chartData.map((item, index, array) => {
        // Media mobilă simplă
        const start = Math.max(0, index - 2);
        const relevantItems = array.slice(start, index + 1);
        const sum = relevantItems.reduce((acc, curr) => acc + curr.cantitate, 0);

        return {
            ...item,
            trend: sum / relevantItems.length
        };
    });

    return (
        <div className="w-full" style={{ height: '400px' }}>
            <h2 className="text-center mb-4 text-black">Consum lunar de bunuri</h2>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={dataWithTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    className='text-black'
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={0}
                        tickMargin={10}
                    />
                    <YAxis
                        label={{
                            value: 'Cantitate consumată',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                        }}
                    />
                    <Tooltip
                        formatter={(value, name, entry) => {
                            if (name === 'Cantitate') {
                                const itemName = (entry as any).payload.name;
                                const bun = liniiConsum.find(l => l.bun.nume_bun === itemName);
                                return [`${value} ${bun?.bun.unitate_masura || ''}`, name];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar dataKey="cantitate" name="Cantitate bun" color='black' className='text-black'>
                        {/* În loc să folosim proprietatea fill, folosim componentele Cell */}
                        {dataWithTrend.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={bunColorMap[entry.name]} color='black' />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="trend"
                        name="Tendință consum"
                        stroke="#ff7300"
                        strokeWidth={2}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConsumChart;