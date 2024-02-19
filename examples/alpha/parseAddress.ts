import "dotenv/config"
import { Odyssey, Buffer } from "../../src"
import { ALPHAAPI } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const addressString: string = "A-dione19zfygxaf59stehzedhxjesads0p5jdvfeedal0"
  const addressBuffer: Buffer = achain.parseAddress(addressString)
  console.log(addressBuffer)
}

main()
