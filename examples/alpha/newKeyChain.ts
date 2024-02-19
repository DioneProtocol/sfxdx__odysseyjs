import "dotenv/config"
import { Odyssey } from "../../src"
import { ALPHAAPI, KeyChain } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const keyChain: KeyChain = achain.newKeyChain()
  console.log(keyChain)
}

main()
