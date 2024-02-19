import "dotenv/config"
import { Odyssey } from "../../src"
import { DELTAAPI, KeyChain, KeyPair } from "../../src/apis/delta"
import { CreateKeyPairResponse } from "../../src/apis/delta/interfaces"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const dchain: DELTAAPI = odyssey.DChain()

const main = async (): Promise<any> => {
  const keychain: KeyChain = dchain.keyChain()
  const keypair: KeyPair = keychain.makeKey()
  const address: string = keypair.getAddressString()
  const publidKey: string = keypair.getPublidKeyString()
  const privateKey: string = keypair.getPrivateKeyString()
  const createKeypairResponse: CreateKeyPairResponse = {
    address: address,
    publidKey: publidKey,
    privateKey: privateKey
  }
  console.log(createKeypairResponse)
}

main()
