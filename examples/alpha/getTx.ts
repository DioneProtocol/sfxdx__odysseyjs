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
  const txID: string = "Cgse9mcZeXrYsBGrF3SqjoDHoqxauiwxm6zrgkDa5kxSa5K85"
  const encoding: string = "json"
  const tx: string | object = await achain.getTx(txID, encoding)
  console.log(tx)
}

main()
