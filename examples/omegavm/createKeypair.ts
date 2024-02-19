import "dotenv/config"
import { Odyssey } from "../../src"
import { OmegaVMAPI, KeyChain, KeyPair } from "../../src/apis/omegavm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()

const main = async (): Promise<any> => {
  const keychain: KeyChain = ochain.keyChain()
  const keypair: KeyPair = keychain.makeKey()
  const response: {
    address: string
    publidKey: string
    privateKey: string
  } = {
    address: keypair.getAddressString(),
    publidKey: keypair.getPublidKeyString(),
    privateKey: keypair.getPrivateKeyString()
  }
  console.log(response)
}

main()
