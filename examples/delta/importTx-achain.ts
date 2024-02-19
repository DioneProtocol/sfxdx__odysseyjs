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
const dKeychain: KeyChain = dchain.keyChain()
const cHeaAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
dKeychain.importKey(privKey)
const dAddresses: Buffer[] = dchain.keyChain().getAddresses()
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const dChainBlockchainIdStr: string = Defaults.network[networkID].D.blockchainID
const dChainBlockchainIdBuf: Buffer = bintools.cb58Decode(dChainBlockchainIdStr)
const aChainBlockchainIdStr: string = Defaults.network[networkID].A.blockchainID
const aChainBlockchainIdBuf: Buffer = bintools.cb58Decode(aChainBlockchainIdStr)
const importedIns: TransferableInput[] = []
const deltaOutputs: DELTAOutput[] = []
const fee: BN = dchain.getDefaultTxFee()

const main = async (): Promise<any> => {
  const u: any = await dchain.getUTXOs(dAddressStrings[0], "A")
  const utxoSet: UTXOSet = u.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO) => {
    const assetID: Buffer = utxo.getAssetID()
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const output: AmountOutput = utxo.getOutput() as AmountOutput
    const amt: BN = output.getAmount().clone()
    const input: SECPTransferInput = new SECPTransferInput(amt)
    input.addSignatureIdx(0, dAddresses[0])
    const xferin: TransferableInput = new TransferableInput(
      txid,
      outputidx,
      assetID,
      input
    )
    importedIns.push(xferin)

    const deltaOutput: DELTAOutput = new DELTAOutput(
      cHeaAddress,
      amt.sub(fee),
      assetID
    )
    deltaOutputs.push(deltaOutput)
  })

  const importTx: ImportTx = new ImportTx(
    networkID,
    dChainBlockchainIdBuf,
    aChainBlockchainIdBuf,
    importedIns,
    deltaOutputs
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(importTx)
  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
