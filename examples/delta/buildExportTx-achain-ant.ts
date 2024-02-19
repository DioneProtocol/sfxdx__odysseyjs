import "dotenv/config"
import { Odyssey, BN } from "../../src"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx
} from "../../src/apis/delta"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  costExportTx
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const dchain: DELTAAPI = odyssey.DChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const aKeychain: ALPHAKeyChain = achain.keyChain()
const dKeychain: DELTAKeyChain = dchain.keyChain()
aKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const aChainBlockchainIdStr: string = Defaults.network[networkID].A.blockchainID
const cHeaAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const Web3 = require("web3")
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1
const assetID: string = "8eqonZUiJZ655TLQdhFDCqY8oV4SPDMPzqfoVMVsSNE4wSMWu"

const main = async (): Promise<any> => {
  let balance: BN = await web3.eth.getBalance(cHeaAddress)
  balance = new BN(balance.toString().substring(0, 17))
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  const txcount = await web3.eth.getTransactionCount(cHeaAddress)
  const nonce: number = txcount
  const locktime: BN = new BN(0)
  let amount: BN = new BN(100)
  let fee: BN = baseFee

  let unsignedTx: UnsignedTx = await dchain.buildExportTx(
    amount,
    assetID,
    aChainBlockchainIdStr,
    cHeaAddress,
    dAddressStrings[0],
    aAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )
  const exportCost: number = costExportTx(unsignedTx)
  fee = baseFee.mul(new BN(exportCost))
  unsignedTx = await dchain.buildExportTx(
    amount,
    assetID,
    aChainBlockchainIdStr,
    cHeaAddress,
    dAddressStrings[0],
    aAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
