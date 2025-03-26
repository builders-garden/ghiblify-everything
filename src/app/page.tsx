"use client";

import React, { useEffect } from "react";

import { useFrameSplash } from "@/providers/FrameSplashProvider";

// eslint-disable-next-line import/no-default-export
export default function Home() {
  const { dismiss } = useFrameSplash();

  useEffect(() => {
    dismiss();
  }, [dismiss]);

  return (
    <div
      className="w-full min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/bg.png")' }}
    >
      <div className="flex-1 flex flex-col items-center p-8 gap-8">
        <div className="relative w-full max-w-4xl h-[400px] flex justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`
                absolute w-[200px] aspect-square bg-white/20 rounded-lg border-2 border-dashed border-white/50 
                flex items-center justify-center shadow-xl backdrop-blur-sm
                transition-transform hover:scale-105 hover:z-10
                ${i === 1 ? "left-[5%] rotate-[-8deg] top-[45%] z-[2]" : ""}
                ${i === 2 ? "left-[25%] rotate-[4deg] top-[10%] z-[1]" : ""}
                ${i === 3 ? "left-[45%] rotate-[12deg] top-[50%] z-[3]" : ""}
              `}
            >
              <span className="text-white/70">Image {i}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-white">Ghiblify Yourself</h1>
          <button className="px-8 py-3 bg-[#e46d49] hover:bg-[#b63b15] transition-colors rounded-full text-white font-semibold">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
