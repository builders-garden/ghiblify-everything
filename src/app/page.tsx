"use client";

import { motion } from "motion/react";
import React, { useEffect } from "react";

import { CollectButton } from "@/components/app/collectButton";
import { useFrameSplash } from "@/providers/FrameSplashProvider";

// eslint-disable-next-line import/no-default-export
export default function Home() {
  const { dismiss } = useFrameSplash();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGenerating, setIsGenerating] = React.useState(false);

  useEffect(() => {
    dismiss();
  }, [dismiss]);

  return (
    <div
      className="w-full min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/bg.png")' }}
    >
      <div className="flex-1 flex flex-col items-center p-8 gap-8">
        {!isGenerating ? (
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
        ) : (
          <div className="relative w-full max-w-4xl h-[450px] flex justify-center items-center overflow-hidden">
            <motion.div
              className="absolute z-0 w-[420px] h-[420px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,200,0,0) 70%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="w-[400px] aspect-square rounded-2xl relative z-[1]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Container for synchronized movements */}
              <motion.div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                animate={{
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* More transparent blurred background */}
                <div className="absolute inset-0 backdrop-blur-md bg-[#E46D49]/20" />
              </motion.div>

              {/* Particle container that extends beyond boundaries */}
              <div
                className="absolute -inset-64 pointer-events-none"
                style={{ zIndex: 5 }}
              >
                {/* Inner particles that appear to start inside and dissolve as they travel */}
                {Array.from({ length: 75 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      background: `rgba(${220 + Math.random() * 35}, ${180 + Math.random() * 75}, ${20 + Math.random() * 60}, ${0.5 + Math.random() * 0.5})`,
                      width: 1 + Math.random() * 4,
                      height: 1 + Math.random() * 4,
                      filter: "blur(0.5px) brightness(1.5)",
                      boxShadow:
                        "0 0 2px #fff, 0 0 4px #fff8a3, 0 0 8px #ffca7a",
                      zIndex: Math.random() > 0.5 ? 20 : -1,
                    }}
                    initial={{
                      x: 200,
                      y: 200,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [200, 200 + (Math.random() * 700 - 350)],
                      y: [200, 200 + (Math.random() * 700 - 350)],
                      scale: [0, Math.random() * 0.7 + 0.3, 0],
                      opacity: [0, Math.random() * 0.6 + 0.4, 0],
                      filter: [
                        "blur(0.5px) brightness(1.5)",
                        "blur(1.5px) brightness(1.2)",
                        "blur(2px) brightness(1)",
                      ],
                      boxShadow: [
                        "0 0 2px #fff, 0 0 4px #fff8a3, 0 0 8px #ffca7a",
                        "0 0 1px #fff, 0 0 2px #fff8a3, 0 0 4px #ffca7a",
                        "0 0 0px #fff, 0 0 0px #fff8a3, 0 0 0px #ffca7a",
                      ],
                    }}
                    transition={{
                      duration: 1.2 + Math.random() * 1.8,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeOut",
                      delay: Math.random() * 3,
                    }}
                  />
                ))}
              </div>

              {/* Flowing golden particles - with dissolving effect */}
              <div
                className="absolute inset-0 overflow-visible pointer-events-none"
                style={{ zIndex: 10 }}
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={`flow-${i}`}
                    className="absolute rounded-full"
                    style={{
                      background: `rgba(${230 + Math.random() * 25}, ${190 + Math.random() * 65}, ${50 + Math.random() * 50}, ${0.7 + Math.random() * 0.3})`,
                      width: 2 + Math.random() * 3,
                      height: 2 + Math.random() * 3,
                      filter: "blur(0.5px) brightness(1.5)",
                      boxShadow: `0 0 ${3 + Math.random() * 5}px #fff9c0, 0 0 ${4 + Math.random() * 8}px #ffd700`,
                      zIndex: Math.floor(Math.random() * 30),
                    }}
                    initial={{
                      x: 200,
                      y: 200,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: 200 + Math.cos(Math.random() * Math.PI * 2) * 500,
                      y: 200 + Math.sin(Math.random() * Math.PI * 2) * 500,
                      scale: [0, 1, 0.5, 0.2, 0],
                      opacity: [0, 1, 0.6, 0.3, 0],
                      filter: [
                        "blur(0.5px) brightness(1.5)",
                        "blur(1px) brightness(1.4)",
                        "blur(1.5px) brightness(1.3)",
                        "blur(2px) brightness(1.2)",
                        "blur(3px) brightness(1)",
                      ],
                      boxShadow: [
                        `0 0 ${3 + Math.random() * 5}px #fff9c0, 0 0 ${4 + Math.random() * 8}px #ffd700`,
                        `0 0 ${2 + Math.random() * 4}px #fff9c0, 0 0 ${3 + Math.random() * 6}px #ffd700`,
                        `0 0 ${1 + Math.random() * 3}px #fff9c0, 0 0 ${2 + Math.random() * 4}px #ffd700`,
                        `0 0 ${0 + Math.random() * 2}px #fff9c0, 0 0 ${1 + Math.random() * 2}px #ffd700`,
                        "0 0 0px transparent, 0 0 0px transparent",
                      ],
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Center Text */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ zIndex: 15 }}
              >
                <motion.div
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-white font-bold text-2xl text-center px-6 backdrop-blur-sm rounded-xl py-3 shadow-lg bg-white/10"
                >
                  Ghiblifying...
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* <div className="mt-auto flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-white">Ghiblify Yourself</h1>
          <button
            className="px-8 py-3 bg-[#e46d49] hover:bg-[#b63b15] transition-colors rounded-full text-white font-semibold"
            onClick={() => {
              setIsGenerating(!isGenerating);
            }}
          >
            Generate
          </button>
        </div> */}
        <CollectButton
          price={1000}
          onCollect={() => console.log("Collected!")}
          onError={(error) => console.error(error)}
          isMinting={true}
        />
      </div>
    </div>
  );
}
