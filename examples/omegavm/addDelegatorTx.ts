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
  AddDelegatorTx,
  Tx,
  SECPOwnerOutput,
  ParseableOutput
} from "../../src/apis/omegavm"
import { Output } from "../../src/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  NodeIDStringToBuffer,
  UnixNow
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
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const stakeOuts: TransferableOutput[] = []
const fee: BN = ochain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "Manually add a delegator to the primary subnet"
)
const nodeID: string = "NodeID-DueWyGi3B9jtKfa9mPoecd4YSDJ1ftF69"
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(2630000))

const main = async (): Promise<any> => {
  const stakeAmount: any = await ochain.getMinStake()
  const dioneAssetID: Buffer = await ochain.getDIONEAssetID()
  const getBalanceResponse: any = await ochain.getBalance(oAddressStrings[0])
  const unlocked: BN = new BN(getBalanceResponse.unlocked)
  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    unlocked.sub(fee).sub(stakeAmount.minValidatorStake),
    oAddresses,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetID,
    secpTransferOutput
  )
  outputs.push(transferableOutput)

  const stakeSECPTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    stakeAmount.minValidatorStake,
    oAddresses,
    locktime,
    threshold
  )
  const stakeTransferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetID,
    stakeSECPTransferOutput
  )
  stakeOuts.push(stakeTransferableOutput)

  const rewardOutputOwners: SECPOwnerOutput = new SECPOwnerOutput(
    oAddresses,
    locktime,
    threshold
  )
  const rewardOwners: ParseableOutput = new ParseableOutput(rewardOutputOwners)

  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO) => {
    const output: Output = utxo.getOutput()
    if (output.getOutputID() === 7) {
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

  const addDelegatorTx: AddDelegatorTx = new AddDelegatorTx(
    networkID,
    bintools.cb58Decode(oChainBlockchainID),
    outputs,
    inputs,
    memo,
    NodeIDStringToBuffer(nodeID),
    startTime,
    endTime,
    stakeAmount.minDelegatorStake,
    stakeOuts,
    rewardOwners
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(addDelegatorTx)
  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
