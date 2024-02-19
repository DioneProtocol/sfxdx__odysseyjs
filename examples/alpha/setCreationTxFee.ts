import "dotenv/config"
import { Odyssey, BN } from "../../src"
import { ALPHAAPI } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const fee: BN = new BN(507)
  achain.setCreationTxFee(fee)
  const txFee: BN = achain.getCreationTxFee()
  console.log(txFee)
}

main()
