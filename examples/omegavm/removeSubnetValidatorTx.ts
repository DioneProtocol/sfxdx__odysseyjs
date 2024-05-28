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
  RemoveSubnetValidatorTx
} from "../../src/apis/omegavm"
import { Output } from "../../src/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  NodeIDStringToBuffer,
  Defaults
} from "../../src/utils"

const bintools: BinTools = BinTools.getInstance()
const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
// Keychain with 4 keys-A, B, D, and D
const oKeychain: KeyChain = ochain.keyChain()
// Keypair A
const key = "";
const privKey1: Buffer = new Buffer(key, 'hex')
// O-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
oKeychain.importKey(privKey1)

// Keypair B
let privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// O-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj
oKeychain.importKey(privKey)

// Keypair D
privKey = "PrivateKey-24gdABgapjnsJfnYkfev6YPyQhTaCU72T9bavtDNTYivBLp2eW"
// O-custom1u6eth2fg33ye63mnyu5jswtj326jaypvhyar45
oKeychain.importKey(privKey)

// Keypair D
privKey = "PrivateKey-2uWuEQbY5t7NPzgqzDrXSgGPhi3uyKj2FeAvPUHYo6CmENHJfn"
// O-custom1t3qjau2pf3ys83yallqt4y5xc3l6ya5f7wr6aq
oKeychain.importKey(privKey)
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID
const oChainBlockchainIDBuf: Buffer = bintools.cb58Decode(oChainBlockchainID)
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const fee: BN = ochain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const nodeID: string = "NodeID-3hwBts7XQCan5bmsXkMvhvp9PKmYU3Vew"
const memo: Buffer = Buffer.from(
  "Manually create a removeSubnetValidatorTx which creates a 1-of-2 DIONE utxo and removes a validator from a subnet by correctly signing the 2-of-3 SubnetAuth"
)
const dioneUTXOKeychain: Buffer[] = [oAddresses[0]]

const main = async (): Promise<any> => {
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings)
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    unlocked.sub(fee),
    dioneUTXOKeychain,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetID,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const output: Output = utxo.getOutput()
    if (output.getTypeID() === 7) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      const amt: BN = amountOutput.getAmount().clone()
      const txid: Buffer = utxo.getTxID()
      const outputidx: Buffer = utxo.getOutputIdx()

      const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
      secpTransferInput.addSignatureIdx(0, oAddresses[0])

      const input: TransferableInput = new TransferableInput(
        txid,
        outputidx,
        dioneAssetID,
        secpTransferInput
      )
      inputs.push(input)
    }
  })

  const subnetID: Buffer = bintools.cb58Decode(
    "2ivEh5xHybHhusC2ZzXY7EY99SuR8s2Vet7qwuTsazvnj2VXg2"
  )
  const nodeIDBuf: Buffer = NodeIDStringToBuffer(nodeID)
  const removeSubnetValidatorTx: RemoveSubnetValidatorTx =
    new RemoveSubnetValidatorTx(
      networkID,
      oChainBlockchainIDBuf,
      outputs,
      inputs,
      memo,
      nodeIDBuf,
      subnetID
    )
  removeSubnetValidatorTx.addSignatureIdx(0, oAddresses[3])
  removeSubnetValidatorTx.addSignatureIdx(1, oAddresses[1])
  const unsignedTx: UnsignedTx = new UnsignedTx(removeSubnetValidatorTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
