/**
 * @packageDocumentation
 * @module Utils-Constants
 */

import BN from "bn.js"

export const PrivateKeyPrefix: string = "PrivateKey-"
export const NodeIDPrefix: string = "NodeID-"
export const PrimaryAssetAlias: string = "DIONE"
export const MainnetAPI: string = "api.dione.network"
export const FujiAPI: string = "api.dione-test.network"

export interface D {
  blockchainID: string
  alias: string
  vm: string
  fee?: BN
  gasPrice: BN | number
  chainID?: number
  minGasPrice?: BN
  maxGasPrice?: BN
  txBytesGas?: number
  costPerSignature?: number
  txFee?: BN
  dioneAssetID?: string
}
export interface A {
  blockchainID: string
  alias: string
  vm: string
  creationTxFee: BN | number
  mintTxFee: BN
  dioneAssetID?: string
  txFee?: BN | number
  fee?: BN
}
export interface O {
  blockchainID: string
  alias: string
  vm: string
  creationTxFee: BN | number
  createSubnetTx: BN | number
  createChainTx: BN | number
  minConsumption: number
  maxConsumption: number
  maxStakingDuration: BN
  maxSupply: BN
  minStake: BN
  minStakeDuration: number
  maxStakeDuration: number
  dioneAssetID?: string
  txFee?: BN | number
  fee?: BN
}
export interface Network {
  D: D
  hrp: string
  A: A
  O: O
  [key: string]: D | A | O | string
}
export interface Networks {
  [key: number]: Network
}

export const NetworkIDToHRP: object = {
  1: "dione",
  5: "test",
  1337: "custom",
  12345: "local"
}

export const HRPToNetworkID: object = {
  dione: 1,
  test: 5,
  custom: 1337,
  local: 12345
}

export const NetworkIDToNetworkNames: object = {
  1: ["Odyssey", "Mainnet"],
  5: ["Testnet"],
  1337: ["Custom Network"],
  12345: ["Local Network"]
}

export const NetworkNameToNetworkID: object = {
  Odyssey: 1,
  Mainnet: 1,
  Testnet: 5,
  Custom: 1337,
  "Custom Network": 1337,
  Local: 12345,
  "Local Network": 12345
}

export const FallbackHRP: string = "custom"
export const FallbackNetworkName: string = "Custom Network"
export const FallbackDELTAChainID: number = 43112

export const DefaultNetworkID: number = 1

export const OmegaChainID: string = "11111111111111111111111111111111LpoYY"
export const PrimaryNetworkID: string = "11111111111111111111111111111111LpoYY"
export const AChainAlias: string = "A"
export const DChainAlias: string = "D"
export const OChainAlias: string = "O"
export const AChainVMName: string = "alpha"
export const DChainVMName: string = "delta"
export const OChainVMName: string = "omegavm"

// DO NOT use the following private keys and/or mnemonic on Fuji or Testnet
// This address/account is for testing on the local avash network
export const DefaultLocalGenesisPrivateKey: string =
  "ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"
export const DefaultDELTALocalGenesisPrivateKey: string =
  "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027"
export const DefaultDELTALocalGenesisAddress: string =
  "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
export const mnemonic: string =
  "output tooth keep tooth bracket fox city sustain blood raise install pond stem reject long scene clap gloom purpose mean music piece unknown light"

export const ONEDIONE: BN = new BN(1000000000)

export const DECIDIONE: BN = ONEDIONE.div(new BN(10))

export const CENTIDIONE: BN = ONEDIONE.div(new BN(100))

export const MILLIDIONE: BN = ONEDIONE.div(new BN(1000))

export const MICRODIONE: BN = ONEDIONE.div(new BN(1000000))

export const NANODIONE: BN = ONEDIONE.div(new BN(1000000000))

export const WEI: BN = new BN(1)

export const GWEI: BN = WEI.mul(new BN(1000000000))

export const DIONEGWEI: BN = NANODIONE.clone()

export const DIONESTAKECAP: BN = ONEDIONE.mul(new BN(3000000))

// Start mainnet
let dioneAssetID: string = "2jgmdB7VbihDhwW1z4XwZ9reY6wSbZgRJs3Yp7YkkXoZmpVe4E"
const n1A: A = {
  blockchainID: "YT3V2LWXBFSaqViCfLuL4KCpSxMy4M516NYBdfq8nuNpcNEdd",
  dioneAssetID: dioneAssetID,
  alias: AChainAlias,
  vm: AChainVMName,
  txFee: MILLIDIONE.mul(new BN(50)),
  creationTxFee: DECIDIONE,
  mintTxFee: MILLIDIONE.mul(new BN(50))
}

const n1O: O = {
  blockchainID: OmegaChainID,
  dioneAssetID: dioneAssetID,
  alias: OChainAlias,
  vm: OChainVMName,
  txFee: MILLIDIONE.mul(new BN(50)),
  createSubnetTx: ONEDIONE,
  createChainTx: ONEDIONE,
  creationTxFee: DECIDIONE,
  minConsumption: 0.1,
  maxConsumption: 0.12,
  maxStakingDuration: new BN(31536000),
  maxSupply: new BN(720000000).mul(ONEDIONE),
  minStake: ONEDIONE.mul(new BN(2000)),
  minStakeDuration: 2 * 7 * 24 * 60 * 60, //two weeks
  maxStakeDuration: 365 * 24 * 60 * 60, // one year
}

const n1D: D = {
  blockchainID: "2Hxk7eM8VprbCKwv3gZw9GebajFExRMcJKPCwvysmnUNFwP8Ng",
  alias: DChainAlias,
  vm: DChainVMName,
  txBytesGas: 1,
  costPerSignature: 1000,
  // DEPRECATED - txFee
  // WILL BE REMOVED IN NEXT MAJOR VERSION BUMP
  txFee: MILLIDIONE,
  // DEPRECATED - gasPrice
  // WILL BE REMOVED IN NEXT MAJOR VERSION BUMP
  gasPrice: GWEI.mul(new BN(225)),
  minGasPrice: GWEI.mul(new BN(25)),
  maxGasPrice: GWEI.mul(new BN(1000)),
  chainID: 43112
}
// End Mainnet

// Start Testnet
dioneAssetID = "U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK"
const n5A: A = {
  blockchainID: "2JVSBoinj9C2J33VntvzYtVJNZdN2NKiwwKjcumHUWEb5DbBrm",
  dioneAssetID: dioneAssetID,
  alias: AChainAlias,
  vm: AChainVMName,
  txFee: MILLIDIONE,
  creationTxFee: CENTIDIONE,
  mintTxFee: MILLIDIONE
}

const n5O: O = {
  blockchainID: OmegaChainID,
  dioneAssetID: dioneAssetID,
  alias: OChainAlias,
  vm: OChainVMName,
  txFee: MILLIDIONE,
  creationTxFee: CENTIDIONE,
  createSubnetTx: ONEDIONE,
  createChainTx: ONEDIONE,
  minConsumption: 0.1,
  maxConsumption: 0.12,
  maxStakingDuration: new BN(31536000),
  maxSupply: new BN(720000000).mul(ONEDIONE),
  minStake: ONEDIONE,
  minStakeDuration: 24 * 60 * 60, //one day
  maxStakeDuration: 365 * 24 * 60 * 60, // one year
}

const n5D: D = {
  blockchainID: "yH8D7ThNJkxmtkuv2jgBa4P1Rn3Qpr4pPr7QYNfcdoS6k6HWp",
  alias: DChainAlias,
  vm: DChainVMName,
  txBytesGas: 1,
  costPerSignature: 1000,
  // DEPRECATED - txFee
  // WILL BE REMOVED IN NEXT MAJOR VERSION BUMP
  txFee: MILLIDIONE,
  // DEPRECATED - gasPrice
  // WILL BE REMOVED IN NEXT MAJOR VERSION BUMP
  gasPrice: GWEI.mul(new BN(225)),
  minGasPrice: GWEI.mul(new BN(25)),
  maxGasPrice: GWEI.mul(new BN(1000)),
  chainID: 43113
}
// End Testnet

// Start custom network
dioneAssetID = "BUuypiq2wyuLMvyhzFXcPyxPMCgSp7eeDohhQRqTChoBjKziC"
const n1337A: A = { ...n5A }
n1337A.blockchainID = "qzfF3A11KzpcHkkqznEyQgupQrCNS6WV6fTUTwZpEKqhj1QE7"
n1337A.dioneAssetID = dioneAssetID
const n1337O: O = { ...n5O }
n1337O.blockchainID = OmegaChainID
const n1337D: D = { ...n5D }
n1337D.blockchainID = "BR28ypgLATNS6PbtHMiJ7NQ61vfpT27Hj8tAcZ1AHsfU5cz88"
n1337D.dioneAssetID = dioneAssetID
n1337D.chainID = 43112
// End custom network

// Start local network
dioneAssetID = "2fombhL7aGPwj3KH4bfrmJwW6PVnMobf9Y2fn9GwxiAAJyFDbe"
const n12345A: A = { ...n5A }
n12345A.blockchainID = "2eNy1mUFdmaxXNj1eQHUe7Np4gju9sJsEtWQ4MX3ToiNKuADed"
n12345A.dioneAssetID = dioneAssetID
const n12345O: O = { ...n5O }
n12345O.blockchainID = OmegaChainID
const n12345D: D = { ...n5D }
n12345D.blockchainID = "2CA6j5zYzasynPsFeNoqWkmTCt3VScMvXUZHbfDJ8k3oGzAPtU"
n12345D.dioneAssetID = dioneAssetID
n12345D.chainID = 43112
// End local network

export class Defaults {
  static network: Networks = {
    1: {
      hrp: NetworkIDToHRP[1],
      A: n1A,
      "2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM": n1A,
      O: n1O,
      "11111111111111111111111111111111LpoYY": n1O,
      D: n1D,
      "2q9e4r6Mu3U68nU1fYjgbR6JvwrRx36CohpAX5UQxse55x1Q5": n1D
    },
    5: {
      hrp: NetworkIDToHRP[5],
      A: n5A,
      "2JVSBoinj9C2J33VntvzYtVJNZdN2NKiwwKjcumHUWEb5DbBrm": n5A,
      O: n5O,
      "11111111111111111111111111111111LpoYY": n5O,
      D: n5D,
      yH8D7ThNJkxmtkuv2jgBa4P1Rn3Qpr4pPr7QYNfcdoS6k6HWp: n5D
    },
    1337: {
      hrp: NetworkIDToHRP[1337],
      A: n1337A,
      qzfF3A11KzpcHkkqznEyQgupQrCNS6WV6fTUTwZpEKqhj1QE7: n1337A,
      O: n1337O,
      "11111111111111111111111111111111LpoYY": n1337O,
      D: n1337D,
      BR28ypgLATNS6PbtHMiJ7NQ61vfpT27Hj8tAcZ1AHsfU5cz88: n1337D
    },
    12345: {
      hrp: NetworkIDToHRP[12345],
      A: n12345A,
      "2eNy1mUFdmaxXNj1eQHUe7Np4gju9sJsEtWQ4MX3ToiNKuADed": n12345A,
      O: n12345O,
      "11111111111111111111111111111111LpoYY": n12345O,
      D: n12345D,
      "2CA6j5zYzasynPsFeNoqWkmTCt3VScMvXUZHbfDJ8k3oGzAPtU": n12345D
    }
  }
}

/**
 * Rules used when merging sets
 */
export type MergeRule =
  | "intersection" // Self INTERSECT New
  | "differenceSelf" // Self MINUS New
  | "differenceNew" // New MINUS Self
  | "symDifference" // differenceSelf UNION differenceNew
  | "union" // Self UNION New
  | "unionMinusNew" // union MINUS differenceNew
  | "unionMinusSelf" // union MINUS differenceSelf
  | "ERROR" // generate error for testing
