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
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
// A-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
oKeychain.importKey(privKey)

// let privKey: string = "PrivateKey-24gdABgapjnsJfnYkfev6YPyQhTaCU72T9bavtDNTYivBLp2eW"
// O-custom1u6eth2fg33ye63mnyu5jswtj326jaypvhyar45

// privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// O-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj

privKey = "PrivateKey-rKsiN3X4NSJcPpWxMSh7WcuY653NGQ7tfADgQwDZ9yyUPPDG9"
// O-custom1jwwk62ktygl0w29rsq2hq55amamhpvx82kfnte
oKeychain.importKey(privKey)
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const dChainID: string = Defaults.network[networkID].D.blockchainID
const dChainIDBuf: Buffer = bintools.cb58Decode(dChainID)
const oChainID: string = Defaults.network[networkID].O.blockchainID
const oChainIDBuf: Buffer = bintools.cb58Decode(oChainID)
const importedInputs: TransferableInput[] = []
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = ochain.getDefaultTxFee()
const threshold: number = 2
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "Import DIONE to the O-Chain from the D-Chain and consume a multisig atomic output and a create multisig output"
)

const main = async (): Promise<any> => {
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const omegalphaUTXOResponse: any = await ochain.getUTXOs(
    oAddressStrings,
    dChainID
  )
  const utxoSet: UTXOSet = omegalphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  let amount: BN = new BN(0)
  utxos.forEach((utxo: UTXO): void => {
    const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = amountOutput.getAmount()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const assetID: Buffer = utxo.getAssetID()

    if (dioneAssetID.toString("hex") === assetID.toString("hex")) {
      const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
      secpTransferInput.addSignatureIdx(0, oAddresses[1])
      secpTransferInput.addSignatureIdx(1, oAddresses[0])
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
    oChainIDBuf,
    outputs,
    inputs,
    memo,
    dChainIDBuf,
    importedInputs
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(importTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
