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
  const address: string = "A-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p"
  const balances: object[] = await achain.getAllBalances(address)
  console.log(balances)
}

main()
