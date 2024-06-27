import "dotenv/config"
import { Odyssey, BinTools, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx,
  ALPHAConstants,
  UTXO
} from "../../src/apis/alpha"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import { OutputOwners } from "../../src/common"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "../../src/utils"

// run ts-node buildCreateNFTAssetTx.ts
// before you run this example examples/alpha/buildCreateNFTMintTx.ts

const getUTXOIDs = (
  utxoSet: UTXOSet,
  txid: string,
  outputType: number = ALPHAConstants.SECPXFEROUTPUTID_CODECONE,
  assetID = "2fSX8P4vhGNZsD3WELwwTxx4XzCNwicyFiYbp3Q965BMgJ8g9"
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
  "ALPHA utility method buildCreateNFTMintTx to mint an ANT"
)
const payload: Buffer = Buffer.from("NFT Payload")
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const outputOwners: OutputOwners = new OutputOwners(
    aAddresses,
    locktime,
    threshold
  )
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  let txid: Buffer = Buffer.from(
    "2fSX8P4vhGNZsD3WELwwTxx4XzCNwicyFiYbp3Q965BMgJ8g9"
  )
  let assetID: Buffer = Buffer.from(
    "2fSX8P4vhGNZsD3WELwwTxx4XzCNwicyFiYbp3Q965BMgJ8g9"
  )
  utxos.forEach((utxo: UTXO): void => {
    if (utxo.getOutput().getTypeID() === 10) {
      txid = utxo.getTxID()
      assetID = utxo.getAssetID()
    }
  })
  const nftMintOutputUTXOIDs: string[] = getUTXOIDs(
    utxoSet,
    bintools.cb58Encode(txid),
    ALPHAConstants.NFTMINTOUTPUTID,
    bintools.cb58Encode(assetID)
  )
  const nftMintOutputUTXOID: string = nftMintOutputUTXOIDs[0]
  const groupID: number = 0

  const unsignedTx: UnsignedTx = await achain.buildCreateNFTMintTx(
    utxoSet,
    outputOwners,
    aAddressStrings,
    aAddressStrings,
    nftMintOutputUTXOID,
    groupID,
    payload,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(aKeychain)
  const id: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${id}`)
}

main()
