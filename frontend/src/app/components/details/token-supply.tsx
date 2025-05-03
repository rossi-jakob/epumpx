import Config from "../../config/config";
import { spliceAdress } from "../../utils/util";
import { formatEther, formatUnits } from "viem";

export const TokenSupply = (props: any) => {
  const { holderData } = props;

  return (
    <div className="bg-[#191C2F] rounded-4xl p-6 mt-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Total Supply: 1,000,000,000
      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-white font-bold">
            <th className="py-2 text-left">Holder</th>
            <th className="py-2 text-right">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {
            holderData && holderData.length > 0 ? (
              holderData.map((holder : any, i : number) => (
                <tr key={i} className="">
                  <td className="py-2 ">
                    <a
                      href={`${Config.SCAN_LINK}/address/${holder.account}`}
                      target="_blank"
                      className={`${holder.account.toLowerCase() ===
                        Config.CURVE.toLowerCase()
                        ? "!text-primary"
                        : ""
                        }`}
                    >
                      {spliceAdress(holder.account)}
                    </a>
                  </td>
                  <td className="py-2 text-right text-white">
                    <span
                      className={`${holder.account.toLowerCase() ===
                        Config.CURVE.toLowerCase()
                        ? ""
                        : "hidden"
                        } ml-1.5`}
                    >
                      <span className="text-xs">🏦</span>(Bonding curve)
                    </span>

                    <span className="!text-dark">{`${(
                      Number(formatEther(holder.amount)) / 10_000_000
                    ).toFixed(2)} %`}</span>
                  </td>
                </tr>
              ))) : <></>
          }
        </tbody>
      </table>
    </div >
  );
};
