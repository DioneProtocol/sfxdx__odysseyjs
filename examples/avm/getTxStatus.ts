import "dotenv/config"
import { Odyssey } from "../../src"
import { AVMAPI } from "../../src/apis/avm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const xchain: AVMAPI = odyssey.XChain()

const main = async (): Promise<any> => {
  const status: string = await xchain.getTxStatus(
    "2MSJdxJ64sVLQ9GUatyzjCjazrgVMCYbD1zxFHPseqY5r8Hrdp"
  )
  console.log(status)
}

main()
