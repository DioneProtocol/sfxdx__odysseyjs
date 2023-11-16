import "dotenv/config"
import { Odyssey } from "../../src"
import { PlatformVMAPI } from "../../src/apis/platformvm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const pchain: PlatformVMAPI = odyssey.PChain()

const main = async (): Promise<any> => {
  const txID: string = "2T7F1AzTLPzZrUcw22JLcC8yZ8o2muhjrM5zoQ3TBuENbAUvZd"
  const encoding: string = "json"
  const tx: string | object = await pchain.getTx(txID, encoding)
  console.log(tx)
}

main()
