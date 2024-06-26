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

const ip = "testnode.dioneprotocol.com"
const port = undefined
const protocol = "https"
const networkID = Number("5")
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
  "OmegaVM utility method buildAddValidatorTx to add a validator to the primary subnet"
)

const reward = "O-dione18jma8ppw3nhx5r4ap8clazz0dps7rv5ulw7llh"
const nodeID: string = "NodeID-DE8BWpgUtNkTXzjFArzS1nroouzBcXX8J"

const asOf: BN = UnixNow()
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(60 * 60 * 24))
const delegationFee: number = 10

const main = async (): Promise<any> => {
  const stakeAmount: any = await ochain.getMinStake()
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const unsignedTx: UnsignedTx = await ochain.buildAddValidatorTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    oAddressStrings,
    nodeID,
    startTime,
    endTime,
    stakeAmount.minValidatorStake,
    [reward],
    delegationFee,
    locktime,
    threshold,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main().catch((e) => console.log(e))
