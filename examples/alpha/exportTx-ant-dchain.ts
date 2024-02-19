import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
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
} from "../../src/apis/alpha"
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
const bintools: BinTools = BinTools.getInstance()
const aKeychain: KeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const blockchainID: string = Defaults.network[networkID].A.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const exportedOuts: TransferableOutput[] = []
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = achain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "Manually Export DIONE and ANT from A-Chain to D-Chain"
)
// Uncomment for codecID 00 01
// const codecID: number = 1

const main = async (): Promise<any> => {
  const alphaUTXOResponse: any = await achain.getUTXOs(aAddressStrings)
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO) => {
    if (utxo.getOutput().getTypeID() != 6) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      let amt: BN = amountOutput.getAmount().clone()
      const txid: Buffer = utxo.getTxID()
      let assetID: Buffer = utxo.getAssetID()
      const outputidx: Buffer = utxo.getOutputIdx()
      let secpTransferOutput: SECPTransferOutput = new SECPTransferOutput()
      if (dioneAssetIDBuf.toString("hex") === assetID.toString("hex")) {
        secpTransferOutput = new SECPTransferOutput(
          amt.sub(fee),
          aAddresses,
          locktime,
          threshold
        )
      } else {
        secpTransferOutput = new SECPTransferOutput(
          amt,
          aAddresses,
          locktime,
          threshold
        )
      }
      // Uncomment for codecID 00 01
      // secpTransferOutput.setCodecID(codecID)
      const transferableOutput: TransferableOutput = new TransferableOutput(
        assetID,
        secpTransferOutput
      )
      exportedOuts.push(transferableOutput)

      const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
      // Uncomment for codecID 00 01
      // secpTransferInput.setCodecID(codecID)
      secpTransferInput.addSignatureIdx(0, aAddresses[0])

      const input: TransferableInput = new TransferableInput(
        txid,
        outputidx,
        assetID,
        secpTransferInput
      )
      inputs.push(input)
    }
  })

  const exportTx: ExportTx = new ExportTx(
    networkID,
    bintools.cb58Decode(blockchainID),
    outputs,
    inputs,
    memo,
    bintools.cb58Decode(dChainBlockchainID),
    exportedOuts
  )
  // Uncomment for codecID 00 01
  // exportTx.setCodecID(codecID)
  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
