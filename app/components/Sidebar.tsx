import { Circle } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

// Definim interfața pentru tipurile de link-uri
interface LinkItem {
    href: string;
    name: string;
    id: string;
}

// Definim tipul pentru starea de hoveredLinks
type HoveredLinksState = {
    [key: string]: boolean;
};

const Sidebar: React.FC = () => {
    // Folosim un obiect pentru a ține evidența stării de hover pentru fiecare link
    const [hoveredLinks, setHoveredLinks] = useState<HoveredLinksState>({
        comenzi: false,
        consum: false,
        receptii: false,
        altele: false
    });

    // Funcție pentru actualizarea stării de hover
    const handleMouseEnter = (linkName: string): void => {
        setHoveredLinks(prev => ({
            ...prev,
            [linkName]: true
        }));
    };

    const handleMouseLeave = (linkName: string): void => {
        setHoveredLinks(prev => ({
            ...prev,
            [linkName]: false
        }));
    };

    // Array cu datele linkurilor pentru a simplifica renderarea
    const links: LinkItem[] = [
        { href: '/comenzi', name: 'Comenzi', id: 'comenzi' },
        { href: '/consum', name: 'Consum', id: 'consum' },
        { href: '/receptii', name: 'Receptii', id: 'receptii' },
        { href: '/altele', name: 'Altele?', id: 'altele' },
    ];

    return (
        <div className='h-screen bg-white w-1/5 flex flex-col items-center border-r-1 border-r-black fixed'>
            <h1 className='bg-red-600 p-7 m-5 text-center text-xl'>
                <Link href={"/"}>Aplicatie gestionare productie</Link>
            </h1>
            <nav className='flex flex-col gap-7 mt-14 text-black'>
                {links.map((link) => (
                    <Link
                        key={link.id}
                        href={link.href}
                        className={`flex items-center text-[20px] ${hoveredLinks[link.id] ? 'text-red-600' : ''}`}
                        onMouseEnter={() => handleMouseEnter(link.id)}
                        onMouseLeave={() => handleMouseLeave(link.id)}
                    >
                        <span>
                            <Circle
                                size={25}
                                fill='100'
                                color={hoveredLinks[link.id] ? '#991b1b' : '#D9D9D9'}
                                className={`mr-2 ${hoveredLinks[link.id] ? 'fill-red-800' : 'fill-[#D9D9D9]'} transition ease-in-out duration-400`}
                            />
                        </span>
                        {link.name}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar