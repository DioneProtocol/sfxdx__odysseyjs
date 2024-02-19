import "dotenv/config"
import { Odyssey } from "../../src"
import { GetRewardUTXOsResponse } from "../../src/apis/omegavm/interfaces"
import { OmegaVMAPI } from "../../src/apis/omegavm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()

const main = async (): Promise<any> => {
  const txID: string = "2nmH8LithVbdjaXsxVQCQfXtzN9hBbmebrsaEYnLM9T32Uy2Y4"
  const encoding: string = "hex"
  const rewardUTXOs: GetRewardUTXOsResponse = await ochain.getRewardUTXOs(
    txID,
    encoding
  )
  console.log(rewardUTXOs)
}

main()
