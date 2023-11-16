import "dotenv/config"
import { Odyssey } from "../../src"
import { PlatformVMAPI, KeyChain, KeyPair } from "../../src/apis/platformvm"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const pchain: PlatformVMAPI = odyssey.PChain()

const main = async (): Promise<any> => {
  const keychain: KeyChain = pchain.keyChain()
  const keypair: KeyPair = keychain.makeKey()
  const response: {
    address: string
    publicKey: string
    privateKey: string
  } = {
    address: keypair.getAddressString(),
    publicKey: keypair.getPublicKeyString(),
    privateKey: keypair.getPrivateKeyString()
  }
  console.log(response)
}

main()
