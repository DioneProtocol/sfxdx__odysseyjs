import "dotenv/config"
import createHash from "create-hash"
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
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = achain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from("ALPHA manual BaseTx to send DIONE")
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
    aAddresses,
    locktime,
    threshold
  )
  // Uncomment for codecID 00 01
  // secpTransferOutput.setCodecID(codecID)
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetIDBuf,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const alphaUTXOResponse: any = await achain.getUTXOs(aAddressStrings)
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO) => {
    const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = amountOutput.getAmount().clone()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()

    const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
    // Uncomment for codecID 00 01
    // secpTransferInput.setCodecID(codecID)
    secpTransferInput.addSignatureIdx(0, aAddresses[0])

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
    bintools.cb58Decode(aBlockchainID),
    outputs,
    inputs,
    memo
  )
  // Uncomment for codecID 00 01
  // baseTx.setCodecID(codecID)
  const unsignedTx: UnsignedTx = new UnsignedTx(baseTx)
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txBuf: Buffer = tx.toBuffer()

  // Start example script for generating the TxID in
  // advance of issuing the tx to a full node

  // Create sha256 hash of the tx buffer
  const sha256Hash: Buffer = Buffer.from(
    createHash("sha256").update(txBuf).digest().buffer
  )

  // cb58 the sha256 hash
  const generatedTxID: string = bintools.cb58Encode(sha256Hash)
  console.log(`Generated TXID: ${generatedTxID}`)

  // End example script for generating the TxID in
  // advance of issuing the tx to a full node

  // get the actual txID from the full node
  const actualTxID: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${actualTxID}`)
}

main()
