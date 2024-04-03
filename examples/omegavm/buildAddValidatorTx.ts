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

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const oKeychain: KeyChain = ochain.keyChain()
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
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
const startTime: BN = UnixNow().add(new BN(20))
const endTime: BN = startTime.add(new BN(300000))
const delegationFee: number = 5

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
