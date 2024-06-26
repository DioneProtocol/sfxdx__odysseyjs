import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
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
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const ochain: OmegaVMAPI = odyssey.OChain()
const aKeychain: ALPHAKeyChain = achain.keyChain()
const oKeychain: KeyChain = ochain.keyChain()
const key = ""
const privKey: Buffer = new Buffer(key, "hex")
aKeychain.importKey(privKey)
oKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const aChainBlockchainID: string = Defaults.network[networkID].A.blockchainID
const fee: BN = ochain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildExportTx to export DIONE from the O-Chain to the A-Chain"
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings)
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  console.log(unlocked.toString())
  const unsignedTx: UnsignedTx = await ochain.buildExportTx(
    utxoSet,
    new BN(1000),
    aChainBlockchainID,
    aAddressStrings,
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
