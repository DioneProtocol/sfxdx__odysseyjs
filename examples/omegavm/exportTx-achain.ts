import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
import {
  OmegaVMAPI,
  KeyChain,
  SECPTransferOutput,
  SECPTransferInput,
  TransferableOutput,
  TransferableInput,
  UTXOSet,
  UTXO,
  AmountOutput,
  UnsignedTx,
  Tx,
  ExportTx
} from "../../src/apis/omegavm"
import { Output } from "../../src/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  MILLIDIONE
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const ochain: OmegaVMAPI = odyssey.OChain()
const bintools: BinTools = BinTools.getInstance()
const aKeychain: ALPHAKeyChain = achain.keyChain()
const oKeychain: KeyChain = ochain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
aKeychain.importKey(privKey)
oKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const aChainBlockchainID: string = Defaults.network[networkID].A.blockchainID
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID
const exportedOuts: TransferableOutput[] = []
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = MILLIDIONE
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "Manually Export DIONE from O-Chain to A-Chain"
)

const main = async (): Promise<any> => {
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings)
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  console.log(unlocked.sub(fee).toString())
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    new BN(1000000),
    aAddresses,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetID,
    secpTransferOutput
  )
  exportedOuts.push(transferableOutput)

  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO) => {
    const output: Output = utxo.getOutput()
    // if (output.getOutputID() === 7) {
    const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = amountOutput.getAmount().clone()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()

    const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
    secpTransferInput.addSignatureIdx(0, aAddresses[0])

    const input: TransferableInput = new TransferableInput(
      txid,
      outputidx,
      dioneAssetID,
      secpTransferInput
    )
    inputs.push(input)
    // }
  })

  const exportTx: ExportTx = new ExportTx(
    networkID,
    bintools.cb58Decode(oChainBlockchainID),
    outputs,
    inputs,
    memo,
    bintools.cb58Decode(aChainBlockchainID),
    exportedOuts
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
