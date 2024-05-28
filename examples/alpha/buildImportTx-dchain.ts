import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import { ALPHAAPI, KeyChain, UTXOSet, UnsignedTx, Tx } from "../../src/apis/alpha"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  UnixNow
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const key = "";
const privKey: Buffer = new Buffer(key, 'hex')
aKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const threshold: number = 1
const locktime: BN = new BN(0)
const asOf: BN = UnixNow()
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildImportTx to import DIONE to the A-Chain from the D-Chain"
)

const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings,
    dChainBlockchainID
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await achain.buildImportTx(
    utxoSet,
    aAddressStrings,
    dChainBlockchainID,
    aAddressStrings,
    aAddressStrings,
    aAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
