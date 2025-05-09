import Link from 'next/link'
import React from 'react'

export interface Obj {
    key: number,
    name: string,
    num: number,
    link: string,
    linkTitle: string
}

interface ActivityBoxProps {
    obj: Obj;
}

const ActivityBox: React.FC<ActivityBoxProps> = ({ obj }) => {

    return (
        <div className='flex flex-col justify-center items-center bg-[#333] text-white p-4 text-lg gap-5'>
            <h2>{obj.name}</h2>
            <div className="h-px w-full bg-gray-200 mt-2 mb-4"></div>
            <p>Nr. {obj.linkTitle.toLowerCase()}: {obj.num}</p>
            <Link href={obj.link} className='bg-white text-[#333] rounded-full p-3 hover:bg-red-400 transition ease-linear duration-300'>{obj.linkTitle}</Link>
        </div>
    )
}



export default ActivityBox