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
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
aKeychain.importKey(privKey)
oKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const fee: BN = ochain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildExportTx to export DIONE from the O-Chain to the D-Chain"
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings)
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const unsignedTx: UnsignedTx = await ochain.buildExportTx(
    utxoSet,
    unlocked.sub(fee),
    dChainBlockchainID,
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
