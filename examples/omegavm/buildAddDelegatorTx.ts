import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "../../src/utils"

const ip = "localhost"
const port = Number("9650")
const protocol = "http"
const networkID = Number("1")
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const oKeychain: KeyChain = ochain.keyChain()
const key = ""
const privKey: Buffer = new Buffer(key, "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildAddDelegatorTx to add a delegator to the primary subnet"
)
const asOf: BN = UnixNow()
const nodeID: string = "NodeID-BH5AFWkvXzFyPmMqaUfNtozND8TwWwPtx"
const startTime: BN = UnixNow().add(new BN(20))
const endTime: BN = startTime.add(new BN(50))

const main = async (): Promise<any> => {
  const stakeAmount: any = await ochain.getMinStake()
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await ochain.buildAddDelegatorTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    oAddressStrings,
    nodeID,
    startTime,
    endTime,
    stakeAmount.minDelegatorStake,
    oAddressStrings,
    locktime,
    threshold,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
