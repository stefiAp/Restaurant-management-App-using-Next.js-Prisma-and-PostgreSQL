"use client"
import ActivityContainer from "./components/ActivityContainer";
import Sidebar from "./components/Sidebar";


export default function Home() {
  const now = new Date();
  return (
    <div className="bg-white flex">
      <div className="w-1/4">
        <Sidebar />
      </div>
      <div className="flex flex-col w-4/5 p-5">
        <p className="text-black m-7">Data: {now.toLocaleDateString('ro-RO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}</p>

        <ActivityContainer />

      </div>
    </div>

  );
}
