import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
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
  ImportTx
} from "../../src/apis/omegavm"
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
const ochain: OmegaVMAPI = odyssey.OChain()
const bintools: BinTools = BinTools.getInstance()
const oKeychain: KeyChain = ochain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
oKeychain.importKey(privKey)
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const aChainID: string = Defaults.network[networkID].A.blockchainID
const oChainID: string = Defaults.network[networkID].O.blockchainID
const importedInputs: TransferableInput[] = []
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = ochain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "Manually Import DIONE to the O-Chain from the A-Chain"
)

const main = async (): Promise<any> => {
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const omegalphaUTXOResponse: any = await ochain.getUTXOs(
    oAddressStrings,
    aChainID
  )
  const utxoSet: UTXOSet = omegalphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  let amount: BN = new BN(0)
  utxos.forEach((utxo: UTXO) => {
    const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = amountOutput.getAmount().clone()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const assetID: Buffer = utxo.getAssetID()

    if (dioneAssetID.toString("hex") === assetID.toString("hex")) {
      const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
      secpTransferInput.addSignatureIdx(0, oAddresses[0])
      const input: TransferableInput = new TransferableInput(
        txid,
        outputidx,
        dioneAssetID,
        secpTransferInput
      )
      importedInputs.push(input)
      amount = amount.add(amt)
    }
  })
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    amount.sub(fee),
    oAddresses,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetID,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const importTx: ImportTx = new ImportTx(
    networkID,
    bintools.cb58Decode(oChainID),
    outputs,
    inputs,
    memo,
    bintools.cb58Decode(aChainID),
    importedInputs
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(importTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
