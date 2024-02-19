import "dotenv/config"
import { Odyssey, BN } from "../../src"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx,
  UTXOSet
} from "../../src/apis/delta"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  costImportTx
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const dchain: DELTAAPI = odyssey.DChain()
const aKeychain: ALPHAKeyChain = achain.keyChain()
const cHeaAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const dKeychain: DELTAKeyChain = dchain.keyChain()
aKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const aChainBlockchainId: string = Defaults.network[networkID].A.blockchainID

const main = async (): Promise<any> => {
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16) / 1e9)
  let fee: BN = baseFee
  const deltaUTXOResponse: any = await dchain.getUTXOs(
    dAddressStrings,
    aChainBlockchainId
  )
  const utxoSet: UTXOSet = deltaUTXOResponse.utxos
  let unsignedTx: UnsignedTx = await dchain.buildImportTx(
    utxoSet,
    cHeaAddress,
    dAddressStrings,
    aChainBlockchainId,
    dAddressStrings,
    fee
  )
  const importCost: number = costImportTx(unsignedTx)
  fee = baseFee.mul(new BN(importCost))

  unsignedTx = await dchain.buildImportTx(
    utxoSet,
    cHeaAddress,
    dAddressStrings,
    aChainBlockchainId,
    dAddressStrings,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
