'use client'
import React, { useMemo} from "react";
import { TokenCarousel } from "../home/token-carousel";
import { useCurveStatus } from "../hooks/useCurveStatus";

export function TrendingTokens({allTokenInfoArray} : any) {

  return (
    <div className="py-8 mt-30 bg-[#282D44]">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Trending Tokens
      </h2>
      <div className=" pb-4 max-w-5xl mx-auto bg-[#282D44] backdrop-blur-3xl p-2">
        <TokenCarousel tokens={allTokenInfoArray} />
      </div>
    </div>
  );
}
