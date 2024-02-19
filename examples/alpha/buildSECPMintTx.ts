import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx,
  SECPMintOutput,
  ALPHAConstants,
  SECPTransferOutput,
  UTXO
} from "../../src/apis/alpha"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "../../src/utils"

// assetID is generated from running
// ts-node examples/alpha/buildCreateAssetTx.ts
// if you run the alpha.getAllBalances method you will see the asset alongside DIONE, and a balance of 507

const getUTXOIDs = (
  utxoSet: UTXOSet,
  txid: string,
  outputType: number = ALPHAConstants.SECPXFEROUTPUTID_CODECONE,
  assetID = "Ycg5QzddNwe3ebfFXhoGUDnWgC6GE88QRakRnn9dp3nGwqCwD"
): string[] => {
  const utxoids: string[] = utxoSet.getUTXOIDs()
  let result: string[] = []
  for (let index: number = 0; index < utxoids.length; ++index) {
    if (
      utxoids[index].indexOf(txid.slice(0, 10)) != -1 &&
      utxoSet.getUTXO(utxoids[index]).getOutput().getOutputID() == outputType &&
      assetID ==
        bintools.cb58Encode(utxoSet.getUTXO(utxoids[index]).getAssetID())
    ) {
      result.push(utxoids[index])
    }
  }
  return result
}

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const bintools: BinTools = BinTools.getInstance()
const aKeychain: KeyChain = achain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildSECPMintTx to mint an ANT"
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  let mintUTXOID: string = ""
  let mintOwner: SECPMintOutput = new SECPMintOutput()
  let secpTransferOutput: SECPTransferOutput = new SECPTransferOutput()
  let txid: Buffer = Buffer.from("")
  let assetID: Buffer = Buffer.from("")
  utxos.forEach((utxo: UTXO) => {
    if (utxo.getOutput().getTypeID() === 6) {
      txid = utxo.getTxID()
      assetID = utxo.getAssetID()
    }
  })
  const secpMintOutputUTXOIDs: string[] = getUTXOIDs(
    utxoSet,
    bintools.cb58Encode(txid),
    ALPHAConstants.SECPMINTOUTPUTID,
    bintools.cb58Encode(assetID)
  )
  mintUTXOID = secpMintOutputUTXOIDs[0]
  const utxo: UTXO = utxoSet.getUTXO(secpMintOutputUTXOIDs[0])
  mintOwner = utxo.getOutput() as SECPMintOutput
  const amount: BN = new BN(54321)
  secpTransferOutput = new SECPTransferOutput(
    amount,
    aAddresses,
    locktime,
    threshold
  )

  const unsignedTx: UnsignedTx = await achain.buildSECPMintTx(
    utxoSet,
    mintOwner,
    secpTransferOutput,
    aAddressStrings,
    aAddressStrings,
    mintUTXOID,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(aKeychain)
  const id: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${id}`)
}

main()
