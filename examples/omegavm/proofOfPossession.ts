// using https://www.npmjs.com/package/@noble/bls12-381
// import { getPublidKey, sign, verify } from "@noble/bls12-381"
import "dotenv/config"
import { Odyssey, Buffer } from "../../src"
import {
  KeyChain,
  KeyPair,
  OmegaVMAPI,
  ProofOfPossession
} from "../../src/apis/omegavm"

// start placeholder functions
const getPublidKey = (privateKey): Buffer => {
  return new Buffer("00")
}
const sign = (publidKey, privateKey): Buffer => {
  return new Buffer("00")
}
const verify = (signature, message, publidKey): boolean => {
  return true
}
// end placeholder functions

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const keychain: KeyChain = ochain.keyChain()
const keypair: KeyPair = keychain.makeKey()

const main = async (): Promise<any> => {
  const privateKey: string = keypair.getPrivateKey().toString("hex")
  // 48 byte public key
  const publidKey = getPublidKey(privateKey) as Buffer
  // 96 byte signature
  const signature = (await sign(publidKey, privateKey)) as Buffer
  const proofOfPossession: ProofOfPossession = new ProofOfPossession(
    publidKey,
    signature
  )
  const isValid: boolean = await verify(signature, publidKey, publidKey)
  console.log(isValid)
  const pubKey: Buffer = proofOfPossession.getPublidKey()
  const sig: Buffer = proofOfPossession.getSignature()
  console.log(`Public Key:`, pubKey === publidKey)
  console.log(`Signature:`, sig === signature)
}

main()
