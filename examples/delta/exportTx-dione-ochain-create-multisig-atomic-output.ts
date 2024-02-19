import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain as OmegaVMKeyChain
} from "../../src/apis/omegavm"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx,
  DELTAInput,
  ExportTx,
  SECPTransferOutput,
  TransferableOutput
} from "../../src/apis/delta"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  ONEDIONE
} from "../../src/utils"
const Web3 = require("web3")

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const bintools: BinTools = BinTools.getInstance()
const oKeychain: OmegaVMKeyChain = ochain.keyChain()
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
// A-custom18jma8ppw3nhx5r4ap8clazz0dps7rv5u9xde7p

// let privKey: string = "PrivateKey-2PvNEohp3sNL41g4XcCBym5hpeT1szSTZXxL7VGS28eoGvq3k7"
const dKeychain: DELTAKeyChain = dchain.keyChain()
dKeychain.importKey(privKey)

privKey = "PrivateKey-24gdABgapjnsJfnYkfev6YPyQhTaCU72T9bavtDNTYivBLp2eW"
// O-custom1u6eth2fg33ye63mnyu5jswtj326jaypvhyar45
oKeychain.importKey(privKey)

// privKey = "PrivateKey-R6e8f5QSa89DjpvL9asNdhdJ4u8VqzMJStPV8VVdDmLgPd8a4"
// A-custom15s7p7mkdev0uajrd0pzxh88kr8ryccztnlmzvj

privKey = "PrivateKey-rKsiN3X4NSJcPpWxMSh7WcuY653NGQ7tfADgQwDZ9yyUPPDG9"
// O-custom1jwwk62ktygl0w29rsq2hq55amamhpvx82kfnte
oKeychain.importKey(privKey)
const oAddresses: Buffer[] = ochain.keyChain().getAddresses()
const dAddresses: Buffer[] = dchain.keyChain().getAddresses()
const oChainId: string = Defaults.network[networkID].O.blockchainID
const oChainIdBuf: Buffer = bintools.cb58Decode(oChainId)
const dChainId: string = Defaults.network[networkID].D.blockchainID
const dChainIdBuf: Buffer = bintools.cb58Decode(dChainId)
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dioneAssetIDBuf: Buffer = bintools.cb58Decode(dioneAssetID)
const cHeaAddress: string = "0xeA6B543A9E625C04745EcA3D7a74D74B733b8C15"
const deltaInputs: DELTAInput[] = []
const exportedOuts: TransferableOutput[] = []
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 2

const main = async (): Promise<any> => {
  let balance: BN = await web3.eth.getBalance(cHeaAddress)
  balance = new BN(balance.toString().substring(0, 17))
  const fee: BN = dchain.getDefaultTxFee()
  const txcount = await web3.eth.getTransactionCount(cHeaAddress)
  const nonce: number = txcount
  const locktime: BN = new BN(0)

  const deltaInput: DELTAInput = new DELTAInput(
    cHeaAddress,
    ONEDIONE,
    dioneAssetID,
    nonce
  )
  deltaInput.addSignatureIdx(0, dAddresses[0])
  deltaInputs.push(deltaInput)

  const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    ONEDIONE.sub(fee.mul(new BN(2))),
    oAddresses,
    locktime,
    threshold
  )
  const transferableOutput: TransferableOutput = new TransferableOutput(
    dioneAssetIDBuf,
    secpTransferOutput
  )
  exportedOuts.push(transferableOutput)

  const exportTx: ExportTx = new ExportTx(
    networkID,
    dChainIdBuf,
    oChainIdBuf,
    deltaInputs,
    exportedOuts
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
