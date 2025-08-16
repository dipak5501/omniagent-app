
"use client";

import { DynamicWidget } from "@/lib/dynamic";
import { useState, useEffect } from "react";
import DynamicMethods from "@/app/components/Methods";
import { useDarkMode } from "@/lib/useDarkMode";
import Image from "next/image";

export default function Main() {
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="absolute top-0 flex items-center justify-between w-full p-2.5">
        <Image
          className="pl-4 h-8"
          src={isDarkMode ? "/logo-light.png" : "/logo-dark.png"}
          alt="dynamic"
          width={300}
          height={60}
        />
        <div className="flex gap-2.5 pr-4">
          <button
            className={`px-5 py-2.5 rounded-xl border font-bold cursor-pointer transition-colors duration-300 ${isDarkMode ? 'bg-transparent border-white text-white hover:bg-white hover:text-gray-900' : 'bg-transparent border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'}`}
            onClick={() =>
              window.open(
                "https://docs.dynamic.xyz",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Docs
          </button>
          <button
            className="px-5 py-2.5 rounded-xl border-none cursor-pointer transition-colors duration-300 font-bold bg-blue-500 text-white hover:bg-blue-600"
            onClick={() =>
              window.open(
                "https://app.dynamic.xyz",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Get started
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-5">
        <DynamicWidget />
        <DynamicMethods isDarkMode={isDarkMode} />
      </div>
      <div className="absolute bottom-0 right-5">
        <div className="absolute bottom-1.5 right-5 text-gray-500 text-sm font-medium z-10">
          Made with 💙 by dynamic
        </div>
        <Image
          className="h-60 w-auto ml-2"
          src={isDarkMode ? "/image-dark.png" : "/image-light.png"}
          alt="dynamic"
          width={400}
          height={300}
        />
      </div>
    </div>
  );
}
