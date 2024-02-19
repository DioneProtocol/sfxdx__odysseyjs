import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  DELTAAPI,
  DELTAOutput,
  ImportTx,
  TransferableInput,
  KeyChain,
  UTXO,
  UTXOSet,
  SECPTransferInput,
  AmountOutput,
  UnsignedTx,
  Tx
} from "../../src/apis/delta"
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
const dchain: DELTAAPI = odyssey.DChain()
const bintools: BinTools = BinTools.getInstance()
const cKeychain: KeyChain = dchain.keyChain()
const cHexAddress: string = "0xeA6B543A9E625C04745EcA3D7a74D74B733b8C15"
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
// A-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p
cKeychain.importKey(privKey)

// let privKey: string = "PrivateKey-24gdABgapjnsJfnYkfev6YPyQhTaCU72T9bavtDNTYivBLp2eW"
// O-custom1u6eth2fg33ye63mnyu5jswtj326jaypvhyar45

// privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// A-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj

privKey = "PrivateKey-rKsiN3X4NSJcPpWxMSh7WcuY653NGQ7tfADgQwDZ9yyUPPDG9"
// O-custom1jwwk62ktygl0w29rsq2hq55amamhpvx82kfnte
cKeychain.importKey(privKey)
const cAddresses: Buffer[] = dchain.keyChain().getAddresses()
const cAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const dChainId: string = Defaults.network[networkID].D.blockchainID
const dChainIdBuf: Buffer = bintools.cb58Decode(dChainId)
const oChainId: string = Defaults.network[networkID].O.blockchainID
const oChainIdBuf: Buffer = bintools.cb58Decode(oChainId)
const importedIns: TransferableInput[] = []
const deltaOutputs: DELTAOutput[] = []
const fee: BN = dchain.getDefaultTxFee()

const main = async (): Promise<any> => {
  const u: any = await dchain.getUTXOs(cAddressStrings, "O")
  const utxoSet: UTXOSet = u.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const assetID: Buffer = utxo.getAssetID()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const output: AmountOutput = utxo.getOutput() as AmountOutput
    const amount: BN = output.getAmount()
    const input: SECPTransferInput = new SECPTransferInput(amount)
    input.addSignatureIdx(0, cAddresses[1])
    input.addSignatureIdx(1, cAddresses[0])
    const xferin: TransferableInput = new TransferableInput(
      txid,
      outputidx,
      assetID,
      input
    )
    importedIns.push(xferin)

    const deltaOutput: DELTAOutput = new DELTAOutput(
      cHexAddress,
      amount.sub(fee.mul(new BN(3))),
      assetID
    )
    deltaOutputs.push(deltaOutput)
  })

  const importTx: ImportTx = new ImportTx(
    networkID,
    dChainIdBuf,
    oChainIdBuf,
    importedIns,
    deltaOutputs
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(importTx)
  const tx: Tx = unsignedTx.sign(cKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
