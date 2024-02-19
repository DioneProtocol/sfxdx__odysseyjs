import "dotenv/config"
import { Odyssey } from "../../src"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const baseEndpoint: string = "rpc"
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
odyssey.setAddress(ip, port, protocol, baseEndpoint)

const main = async (): Promise<any> => {
  const baseEndpoint: string = odyssey.getBaseEndpoint()
  console.log(baseEndpoint)
}

main()
