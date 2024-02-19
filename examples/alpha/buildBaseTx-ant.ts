import "dotenv/config"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import { Odyssey, BN, Buffer } from "../../src"
import { ALPHAAPI, KeyChain, UTXOSet, UnsignedTx, Tx } from "../../src/apis/alpha"
import { UnixNow } from "../../src/utils"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const xKeychain: KeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
xKeychain.importKey(privKey)
const xAddressStrings: string[] = achain.keyChain().getAddressStrings()
const asOf: BN = UnixNow()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildBaseTx to send an ANT"
)

const main = async (): Promise<any> => {
  const amount: BN = new BN(5)
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    xAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const assetID: string = "KD4byR998qmVivF2zmrhLb6gjwKGSB5xCerV2nYXb4XNXVGEP"
  const toAddresses: string[] = [xAddressStrings[0]]

  const unsignedTx: UnsignedTx = await achain.buildBaseTx(
    utxoSet,
    amount,
    assetID,
    toAddresses,
    xAddressStrings,
    xAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )

  const tx: Tx = unsignedTx.sign(xKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
