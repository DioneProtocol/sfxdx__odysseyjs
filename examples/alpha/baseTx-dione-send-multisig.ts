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
  BaseTx
} from "../../src/apis/alpha"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults
} from "../../src/utils"

const bintools: BinTools = BinTools.getInstance()
const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const aBlockchainID: string = Defaults.network[networkID].A.blockchainID
const aBlockchainIDBuf: Buffer = bintools.cb58Decode(aBlockchainID)
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const odyssey: Odyssey = new Odyssey(
  ip,
  port,
  protocol,
  networkID,
  aBlockchainID
)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
// A-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
aKeychain.importKey(privKey)
privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// A-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj
aKeychain.importKey(privKey)
privKey = "PrivateKey-24b2s6EqkBp9bFG5S3Xxi4bjdxFqeRk56ck7QdQArVbwKkAvxz"
// A-custom1aekly2mwnsz6lswd6u0jqvd9u6yddt5884pyuc
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = achain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA manual spend multisig BaseTx to send DIONE"
)
// Uncomment for codecID 00 01
// const codecID: number = 1

const main = async (): Promise<any> => {
  const getBalanceResponse: any = await achain.getBalance(
    aAddressStrings[0],
    dioneAssetID
  )
  const balance: BN = new BN(getBalanceResponse.balance)
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    balance.sub(fee),
    [aAddresses[0]],
    locktime,
    threshold
  )
  // Uncomment for codecID 00 01
  //   secpTransferOutput.setCodecID(codecID)
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetIDBuf,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const alphaUTXOResponse: any = await achain.getUTXOs(aAddressStrings)
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = amountOutput.getAmount().clone()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()

    const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
    // Uncomment for codecID 00 01
    // secpTransferInput.setCodecID(codecID)
    aAddresses.forEach((aAddress: Buffer, index: number): void => {
      if (index < 3) {
        secpTransferInput.addSignatureIdx(index, aAddress)
      }
    })

    const input: TransferableInput = new TransferableInput(
      txid,
      outputidx,
      dioneAssetIDBuf,
      secpTransferInput
    )
    inputs.push(input)
  })

  const baseTx: BaseTx = new BaseTx(
    networkID,
    aBlockchainIDBuf,
    outputs,
    inputs,
    memo
  )
  // Uncomment for codecID 00 01
  //   baseTx.setCodecID(codecID)
  const unsignedTx: UnsignedTx = new UnsignedTx(baseTx)
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
