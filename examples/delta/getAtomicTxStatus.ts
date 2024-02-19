import "dotenv/config"
import { Odyssey } from "../../src"
import { DELTAAPI } from "../../src/apis/delta"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const dchain: DELTAAPI = odyssey.DChain()

const main = async (): Promise<any> => {
  const txID: string = "FCry2Z1Su9KZqK1XRMhxQS6XuPorxDm3C3RBT7hw32ojiqyvP"
  const status: string = await dchain.getAtomicTxStatus(txID)
  console.log(status)
}

main()
