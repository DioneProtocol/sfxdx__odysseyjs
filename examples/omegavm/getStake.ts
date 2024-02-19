import "dotenv/config"
import { Odyssey } from "../../src"
import { OmegaVMAPI, KeyChain } from "../../src/apis/omegavm"
import { GetStakeResponse } from "../../src/apis/omegavm/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const oKeychain: KeyChain = ochain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const encoding: string = "hex"

const main = async (): Promise<any> => {
  const getStakeResponse: GetStakeResponse = await ochain.getStake(
    oAddressStrings,
    encoding
  )
  console.log(getStakeResponse)
}

main()
