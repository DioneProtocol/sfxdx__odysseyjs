import "dotenv/config"
import { Odyssey, Buffer } from "../../src"
import { ALPHAAPI } from "../../src/apis/alpha"
import { UTXOSet, UTXO } from "../../src/apis/omegavm"
import { Output } from "../../src/common"
// Change the networkID to affect the HRP of the bech32 encoded address
// NetworkID - Bech32 Address - ChainPrefix-HRP1AddressChecksum
//         0 - A-custom19rknw8l0grnfunjrzwxlxync6zrlu33yeg5dya
//         1 - A-dione19rknw8l0grnfunjrzwxlxync6zrlu33y2jxhrg
//         2 - A-cascade19rknw8l0grnfunjrzwxlxync6zrlu33ypmtvnh
//         3 - A-denali19rknw8l0grnfunjrzwxlxync6zrlu33yhc357h
//         4 - A-everest19rknw8l0grnfunjrzwxlxync6zrlu33yn44wty
//         5 - A-fuji19rknw8l0grnfunjrzwxlxync6zrlu33yxqzg0h
//      1337 - A-custom19rknw8l0grnfunjrzwxlxync6zrlu33yeg5dya
//     12345 - A-local19rknw8l0grnfunjrzwxlxync6zrlu33ynpm3qq
const networkID: number = 12345
const odyssey: Odyssey = new Odyssey(
  undefined,
  undefined,
  undefined,
  networkID
)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const utxoset: UTXOSet = new UTXOSet()
  utxoset.addArray([
    "11Zf8cc55Qy1rVgy3t87MJVCSEu539whRSwpdbrtHS6oh5Hnwv1gz8G3BtLJ73MPspLkD93cygZufT4TPYZCmuxW5cRdPrVMbZAHfb6uyGM1jNGBhBiQAgQ6V1yceYf825g27TT6WU4bTdbniWdECDWdGdi84hdiqSJH2y",
    "11Zf8cc55Qy1rVgy3t87MJVCSEu539whRSwpdbrtHS6oh5Hnwv1NjNhqZnievVs2kBD9qTrayBYRs91emGTtmnu2wzqpLstbAPJDdVjf3kjwGWywNCdjV6TPGojVR5vHpJhBVRtHTQXR9VP9MBdHXge8zEBsQJAoZhTbr2"
  ])
  const utxos: UTXO[] = utxoset.getAllUTXOs()

  utxos.map((utxo: UTXO): void => {
    const output: Output = utxo.getOutput()
    const addresses: string[] = output
      .getAddresses()
      .map((x: Buffer): string => {
        const addy: string = achain.addressFromBuffer(x)
        return addy
      })
    console.log(addresses)
  })
}

main()
