import "dotenv/config"
import { Odyssey } from "../../src"
import { ALPHAAPI } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const status: string = await achain.getTxStatus(
    "2MSJdxJ64sVLQ9GUatyzjCjazrgVMCYbD1zxFHPseqY5r8Hrdp"
  )
  console.log(status)
}

main()
