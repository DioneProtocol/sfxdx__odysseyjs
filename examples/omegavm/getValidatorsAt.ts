import "dotenv/config"
import { Odyssey } from "../../src"
import { GetValidatorsAtResponse } from "../../src/apis/omegavm/interfaces"
import { OmegaVMAPI } from "../../src/apis/omegavm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()

const main = async (): Promise<any> => {
  const height: number = 0
  const subnetID: string = "11111111111111111111111111111111LpoYY"
  const validators: GetValidatorsAtResponse = await ochain.getValidatorsAt(
    height,
    subnetID
  )
  console.log(validators)
}

main()
