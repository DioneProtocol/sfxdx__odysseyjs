import "dotenv/config"
import { Odyssey } from "../../src"
import { PlatformVMAPI, KeyChain } from "../../src/apis/platformvm"
import { GetStakeResponse } from "../../src/apis/platformvm/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const pchain: PlatformVMAPI = odyssey.PChain()
const pKeychain: KeyChain = pchain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
pKeychain.importKey(privKey)
const pAddressStrings: string[] = pchain.keyChain().getAddressStrings()
const encoding: string = "hex"

const main = async (): Promise<any> => {
  const getStakeResponse: GetStakeResponse = await pchain.getStake(
    pAddressStrings,
    encoding
  )
  console.log(getStakeResponse)
}

main()
