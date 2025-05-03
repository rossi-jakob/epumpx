import { marketCapData } from "./constant";

export const MarketCapRanking = (props : any) => {
  
  const {tokenInfoArray} = props;

  return (
    <div className="bg-[#1B1E2E] rounded-4xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#0996FF] to-[#0765D0] font-bold py-3 text-center mx-52 rounded-b-4xl">
        Market Cap Ranking
      </div>
      <div className="max-h-[500px] overflow-y-auto table-scroll-container px-8">
        <table className="w-full px-8">
          <thead className="sticky top-0 bg-[#1B1E2E] z-10">
            <tr className="text-white font-bold text-sm border-b border-gray-800">
              <th className="py-3 px-2 text-left">Rank</th>
              <th className="py-3 px-2 text-left">Token Name</th>
              <th className="py-3 px-2 text-left">Market Cap</th>
              <th className="py-3 px-2 text-left">Raised Token</th>
            </tr>
          </thead>
          <tbody>
            {tokenInfoArray.map((item : any, index : number) => (
              <tr key={index} className="border-b border-gray-800/30 px-4">
                <td className="py-3 px-2 text-white text-left">{index + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={item?.logo==""? "/top-token.png" : item?.logo}
                      className="w-6 h-6 rounded-full"
                      alt="Token"
                    />
                    <span className="text-white">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-left text-white">
                  ${item?.marketCap.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center  space-x-2">
                    <img
                      src="/token-icon.svg"
                      className="w-6 h-6 rounded-full"
                      alt="Token"
                    />
                    {/* <span className="text-white">{item.raisedToken}</span> */}
                    <span className="text-white">EPIX</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
