import "dotenv/config"
import { Odyssey, BN } from "../../src"
import { DELTAAPI } from "../../src/apis/delta"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const dchain: DELTAAPI = odyssey.DChain()

const main = async (): Promise<any> => {
  const maxPriorityFeePerGas: string = await dchain.getMaxPriorityFeePerGas()
  console.log(maxPriorityFeePerGas)
}

main()
