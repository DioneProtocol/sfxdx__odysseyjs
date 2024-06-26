import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx,
  InitialStates,
  SECPMintOutput,
  SECPTransferOutput
} from "../../src/apis/alpha"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const key = ""
const privKey: Buffer = new Buffer(key, "hex")
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const outputs: SECPMintOutput[] = []
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildCreateAssetTx to create an ANT"
)
const name: string = "TestToken"
const symbol: string = "TEST"
const denomination: number = 3

const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos

  const amount: BN = new BN(507)
  const vcapSecpOutput = new SECPTransferOutput(
    amount,
    aAddresses,
    locktime,
    threshold
  )
  const initialStates: InitialStates = new InitialStates()
  initialStates.addOutput(vcapSecpOutput)

  const secpMintOutput: SECPMintOutput = new SECPMintOutput(
    aAddresses,
    locktime,
    threshold
  )
  outputs.push(secpMintOutput)

  const unsignedTx: UnsignedTx = await achain.buildCreateAssetTx(
    utxoSet,
    aAddressStrings,
    aAddressStrings,
    initialStates,
    name,
    symbol,
    denomination,
    outputs,
    memo
  )
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
