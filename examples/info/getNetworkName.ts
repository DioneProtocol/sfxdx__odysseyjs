import "dotenv/config"
import { Odyssey } from "../../src"
import { InfoAPI } from "../../src/apis/info"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const info: InfoAPI = odyssey.Info()

const main = async (): Promise<any> => {
  const networkName: string = await info.getNetworkName()
  console.log(networkName)
}

main()
