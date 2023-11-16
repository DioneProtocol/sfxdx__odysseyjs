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
  const address: string[] = ["P-dione1tnuesf6cqwnjw7fxjyk7lhch0vhf0v95wj5jvy"]
  const balance: object = await pchain.getBalance(address)
  console.log(balance)
}

main()
