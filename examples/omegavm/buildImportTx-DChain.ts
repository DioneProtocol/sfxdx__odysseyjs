import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  UnixNow
} from "../../src//utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const oKeychain: KeyChain = ochain.keyChain()
const key = "";
const privKey: Buffer = new Buffer(key, 'hex')
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildImportTx to import DIONE to the O-Chain from the A-Chain"
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(
    oAddressStrings,
    dChainBlockchainID
  )
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const unsignedTx: UnsignedTx = await ochain.buildImportTx(
    utxoSet,
    oAddressStrings,
    dChainBlockchainID,
    oAddressStrings,
    oAddressStrings,
    oAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
