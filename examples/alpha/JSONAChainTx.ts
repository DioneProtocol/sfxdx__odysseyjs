import "dotenv/config"
import { Odyssey, Buffer } from "../../src"
import { ALPHAAPI, Tx } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)

const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const txID: string = "Cgse9mcZeXrYsBGrF3SqjoDHoqxauiwxm6zrgkDa5kxSa5K85"
  const hex = (await achain.getTx(txID)) as string
  const buf: Buffer = new Buffer(hex.slice(2), "hex")
  const tx: Tx = new Tx()
  tx.fromBuffer(buf)
  const jsonStr: string = JSON.stringify(tx)
  console.log(jsonStr)
  const jsn: Object = JSON.parse(jsonStr)
  console.log(jsn)
}

main()
