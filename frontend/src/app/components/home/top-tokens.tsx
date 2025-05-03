"use client";
import { TokenCarousel } from "./token-carousel";
import React from "react";

export default function TopTokens({allTokenInfoArray} : any) {
  return (
    <section className="py-8 bg-[#282D44] component-edge-root">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-1">
          Top Token
        </h2>
        <p className="text-gray-400 text-center font-bold mb-5 text-lg">
          Discover the Leading Tokens Powering Innovation on EPIX Chain
        </p>

        <div className="flex flex-wrap pb-4 gap-4">
          {allTokenInfoArray.length>0 && <TokenCarousel tokens={allTokenInfoArray} />}
          {allTokenInfoArray.length>0 && <TokenCarousel tokens={allTokenInfoArray} direction="rtl" />}
        </div>
      </div>
    </section>
  );
}
