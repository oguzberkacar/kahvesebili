import React from "react";
import { redirect } from "next/navigation";
import coffees from "../../data/coffees.json";
import KardoraBaseLogo from "../../components/KardoraBaseLogo";

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  const { id } = params;
  const stationId = Number(id);

  if (!Number.isFinite(stationId)) {
    redirect("/station");
  }

  // Since we imported coffees, let's type check or cast if needed,
  // but JSON import usually infers types.
  // We added isActive to JSON manually, TypeScript might not know it if we have a type definition file elsewhere.
  // But usually it infers from JSON content.
  const coffee = coffees.find((c) => c.stationId === stationId);

  if (!coffee) {
    redirect("/station");
  }

  // Active State (Idle / Ready)
  if (coffee.isActive) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-[600px] h-[1024px] bg-[#65E5B4] relative flex flex-col items-center pt-[48px] overflow-hidden shadow-2xl">
          {/* Top Info Card */}
          <div className="w-[520px] bg-white rounded-[40px] py-10 px-8 flex flex-col items-center text-center gap-2 shadow-sm">
            <h1 className="text-[40px] font-bold text-[#1F3933]">{coffee.name}</h1>
            <h2 className="text-xl font-bold text-[#1F3933] mb-4">{coffee.roast}</h2>

            <div className="text-[#1F3933] text-lg space-y-1 leading-snug">
              <p>
                <span className="font-bold">Process:</span> {coffee.details.Process}
              </p>
              <p>
                <span className="font-bold">Region:</span> {coffee.details.Region}
              </p>
              <p>
                <span className="font-bold">Altitude:</span> {coffee.details.Altitude}
              </p>
              <p>
                <span className="font-bold">Variety:</span> {coffee.details.Variety}
              </p>
              <p className="pt-2">
                <span className="font-bold">Flavor Notes:</span> {coffee.details["Flavor Notes"]}
              </p>
            </div>
          </div>

          {/* Middle Text */}
          <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-8">
            <h2 className="text-[#1F3933] text-[36px] font-bold leading-tight">
              Would you
              <br />
              like a drink?
            </h2>
          </div>

          {/* Bottom Arc & Logo */}
          <div className="absolute -bottom-[65%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-white rounded-full flex items-start justify-center pt-[8%]">
            <div className="mt-8">
              <KardoraBaseLogo fillColor="#1F3933" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Active State (Design Implementation)
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      {/* Container fixed at 600x1024px */}
      <div className="w-[600px] h-[1024px] bg-[#1F3933] relative flex flex-col items-center pt-[48px] overflow-hidden shadow-2xl">
        {/* Top Info Card */}
        <div className="w-[520px] bg-white rounded-[40px] p-10 flex flex-col items-center text-center">
          <h1 className="text-[40px] font-bold text-[#1F3933] mb-4">{coffee.name}</h1>
          <p className="text-[24px] leading-tight text-[#1F3933] font-medium">{coffee.description}</p>
          {/* 
                   Note: The image example text was slightly different "Ethiopian coffee beans...", 
                   but we use the DB description as per standard practice unless hardcoded text is requested.
                   "A smooth, medium-bodied coffee..."
                */}
        </div>

        {/* We can not serve text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-8">
          <h2 className="text-white text-[32px] font-bold leading-normal">
            We can not serve to
            <br />
            you at moment
          </h2>
        </div>

        {/* Bottom Arc & Logo */}
        <div className="absolute -bottom-[65%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-white rounded-full flex items-start justify-center pt-[8%]">
          <div className="mt-8">
            <KardoraBaseLogo fillColor="#1F3933" />
          </div>
        </div>
      </div>
    </div>
  );
}
