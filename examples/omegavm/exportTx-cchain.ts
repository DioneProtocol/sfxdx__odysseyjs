import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import { DELTAAPI, KeyChain as DELTAKeyChain } from "../../src/apis/delta"
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
const dchain: DELTAAPI = odyssey.DChain()
const ochain: OmegaVMAPI = odyssey.OChain()
const bintools: BinTools = BinTools.getInstance()
const dKeychain: DELTAKeyChain = dchain.keyChain()
const oKeychain: KeyChain = ochain.keyChain()
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
// A-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
dKeychain.importKey(privKey)
oKeychain.importKey(privKey)

privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// O-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj
dKeychain.importKey(privKey)
oKeychain.importKey(privKey)
const dAddresses: Buffer[] = dchain.keyChain().getAddresses()
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID
const exportedOuts: TransferableOutput[] = []
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = MILLIDIONE
const threshold: number = 2
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "Manually Export DIONE from O-Chain to D-Chain"
)

const main = async (): Promise<any> => {
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings[0])
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  console.log(unlocked.sub(fee).toString())
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    unlocked.sub(fee),
    dAddresses,
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
  utxos.forEach((utxo: UTXO): void => {
    const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = amountOutput.getAmount().clone()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()

    const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
    secpTransferInput.addSignatureIdx(0, oAddresses[0])
    if (utxo.getOutput().getThreshold() === 2) {
      secpTransferInput.addSignatureIdx(1, oAddresses[1])
    }

    const input: TransferableInput = new TransferableInput(
      txid,
      outputidx,
      dioneAssetID,
      secpTransferInput
    )
    inputs.push(input)
  })

  const exportTx: ExportTx = new ExportTx(
    networkID,
    bintools.cb58Decode(oChainBlockchainID),
    outputs,
    inputs,
    memo,
    bintools.cb58Decode(dChainBlockchainID),
    exportedOuts
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
