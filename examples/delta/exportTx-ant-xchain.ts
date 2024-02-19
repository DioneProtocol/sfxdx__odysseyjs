import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
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
import { RequestResponseData } from "../../src/common"
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
const xKeychain: ALPHAKeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const cKeychain: DELTAKeyChain = dchain.keyChain()
xKeychain.importKey(privKey)
cKeychain.importKey(privKey)
const xAddresses: Buffer[] = achain.keyChain().getAddresses()
const cAddresses: Buffer[] = dchain.keyChain().getAddresses()
const aChainBlockchainIdStr: string = Defaults.network[networkID].A.blockchainID
const aChainBlockchainIdBuf: Buffer = bintools.cb58Decode(aChainBlockchainIdStr)
const dChainBlockchainIdStr: string = Defaults.network[networkID].D.blockchainID
const dChainBlockchainIdBuf: Buffer = bintools.cb58Decode(dChainBlockchainIdStr)
const cHexAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const deltaInputs: DELTAInput[] = []
let exportedOuts: TransferableOutput[] = []
const Web3 = require("web3")
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

const main = async (): Promise<any> => {
  const antAssetIDStr: string =
    "verma4Pa9biWKbjDGNsTXU47cYCyDSNGSU1iBkxucfVSFVXdv"
  const antAssetIDBuf: Buffer = bintools.cb58Decode(antAssetIDStr)
  const antAssetBalanceResponse: RequestResponseData = await dchain.callMethod(
    "eth_getAssetBalance",
    [cHexAddress, "latest", antAssetIDStr],
    "ext/bc/D/rpc"
  )
  const antAssetBalance: number = parseInt(
    antAssetBalanceResponse.data.result,
    16
  )
  let dioneBalance: BN = await web3.eth.getBalance(cHexAddress)
  dioneBalance = new BN(dioneBalance.toString().substring(0, 17))
  const fee: BN = dchain.getDefaultTxFee()
  const txcount = await web3.eth.getTransactionCount(cHexAddress)
  const nonce: number = txcount
  const locktime: BN = new BN(0)

  let deltaInput: DELTAInput = new DELTAInput(
    cHexAddress,
    dioneBalance,
    dioneAssetID,
    nonce
  )
  deltaInput.addSignatureIdx(0, cAddresses[0])
  deltaInputs.push(deltaInput)

  deltaInput = new DELTAInput(cHexAddress, antAssetBalance, antAssetIDStr, nonce)
  deltaInput.addSignatureIdx(0, cAddresses[0])
  deltaInputs.push(deltaInput)

  let secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    dioneBalance.sub(fee),
    xAddresses,
    locktime,
    threshold
  )
  let transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetIDBuf,
    secpTransferOutput
  )
  exportedOuts.push(transferableOutput)

  secpTransferOutput = new SECPTransferOutput(
    new BN(antAssetBalance),
    xAddresses,
    locktime,
    threshold
  )
  transferableOutput = new TransferableOutput(antAssetIDBuf, secpTransferOutput)
  exportedOuts.push(transferableOutput)
  exportedOuts = exportedOuts.sort(TransferableOutput.comparator())

  const exportTx: ExportTx = new ExportTx(
    networkID,
    dChainBlockchainIdBuf,
    aChainBlockchainIdBuf,
    deltaInputs,
    exportedOuts
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(cKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
