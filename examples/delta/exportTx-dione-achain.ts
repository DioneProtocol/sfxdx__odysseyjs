import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import Web3 from "web3"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx,
  DELTAInput,
  ExportTx,
  SECPTransferOutput,
  TransferableOutput
} from "../../src/apis/delta"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const dchain: DELTAAPI = odyssey.DChain()
const bintools: BinTools = BinTools.getInstance()
const aKeychain: ALPHAKeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const dKeychain: DELTAKeyChain = dchain.keyChain()
aKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const dAddresses: Buffer[] = dchain.keyChain().getAddresses()
const aChainBlockchainIdStr: string = Defaults.network[networkID].A.blockchainID
const aChainBlockchainIdBuf: Buffer = bintools.cb58Decode(aChainBlockchainIdStr)
const dChainBlockchainIdStr: string = Defaults.network[networkID].D.blockchainID
const dChainBlockchainIdBuf: Buffer = bintools.cb58Decode(dChainBlockchainIdStr)
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const dHexAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const deltaInputs: DELTAInput[] = []
const exportedOuts: TransferableOutput[] = []
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

const main = async (): Promise<any> => {
  let balance: BN = new BN(await web3.eth.getBalance(dHexAddress))
  balance = new BN(balance.toString().substring(0, 17))
  const fee: BN = dchain.getDefaultTxFee()
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce: number = txcount
  const locktime: BN = new BN(0)

  const deltaInput: DELTAInput = new DELTAInput(
    dHexAddress,
    balance,
    dioneAssetID,
    nonce
  )
  deltaInput.addSignatureIdx(0, dAddresses[0])
  deltaInputs.push(deltaInput)

  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    new BN(10000000),
    aAddresses,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetIDBuf,
    secpTransferOutput
  )
  exportedOuts.push(transferableOutput)

  const exportTx: ExportTx = new ExportTx(
    networkID,
    dChainBlockchainIdBuf,
    aChainBlockchainIdBuf,
    deltaInputs,
    exportedOuts
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
