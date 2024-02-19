/**
 * @packageDocumentation
 * @module Odyssey
 */
import OdysseyCore from "./odyssey"
import { AdminAPI } from "./apis/admin/api"
import { AuthAPI } from "./apis/auth/api"
import { ALPHAAPI } from "./apis/alpha/api"
import { DELTAAPI } from "./apis/delta/api"
import { GenesisAsset } from "./apis/alpha/genesisasset"
import { GenesisData } from "./apis/alpha/genesisdata"
import { HealthAPI } from "./apis/health/api"
import { IndexAPI } from "./apis/index/api"
import { InfoAPI } from "./apis/info/api"
import { KeystoreAPI } from "./apis/keystore/api"
import { MetricsAPI } from "./apis/metrics/api"
import { OmegaVMAPI } from "./apis/omegavm/api"
import { Socket } from "./apis/socket/socket"
import { DefaultNetworkID, Defaults } from "./utils/constants"
import { getPreferredHRP } from "./utils/helperfunctions"
import BinTools from "./utils/bintools"
import DB from "./utils/db"
import Mnemonic from "./utils/mnemonic"
import PubSub from "./utils/pubsub"
import HDNode from "./utils/hdnode"
import BN from "bn.js"
import { Buffer } from "buffer/"

/**
 * OdysseyJS is middleware for interacting with Odyssey node RPC APIs.
 *
 * Example usage:
 * ```js
 * const odyssey: Odyssey = new Odyssey("127.0.0.1", 9650, "https")
 * ```
 *
 */
export default class Odyssey extends OdysseyCore {
  /**
   * Returns a reference to the Admin RPC.
   */
  Admin = () => this.apis.admin as AdminAPI

  /**
   * Returns a reference to the Auth RPC.
   */
  Auth = () => this.apis.auth as AuthAPI

  /**
   * Returns a reference to the DELTAAPI RPC pointed at the D-Chain.
   */
  DChain = () => this.apis.dchain as DELTAAPI

  /**
   * Returns a reference to the ALPHA RPC pointed at the A-Chain.
   */
  AChain = () => this.apis.achain as ALPHAAPI

  /**
   * Returns a reference to the Health RPC for a node.
   */
  Health = () => this.apis.health as HealthAPI

  /**
   * Returns a reference to the Index RPC for a node.
   */
  Index = () => this.apis.index as IndexAPI

  /**
   * Returns a reference to the Info RPC for a node.
   */
  Info = () => this.apis.info as InfoAPI

  /**
   * Returns a reference to the Metrics RPC.
   */
  Metrics = () => this.apis.metrics as MetricsAPI

  /**
   * Returns a reference to the Keystore RPC for a node. We label it "NodeKeys" to reduce
   * confusion about what it's accessing.
   */
  NodeKeys = () => this.apis.keystore as KeystoreAPI

  /**
   * Returns a reference to the OmegaVM RPC pointed at the O-Chain.
   */
  OChain = () => this.apis.ochain as OmegaVMAPI

  /**
   * Creates a new Odyssey instance. Sets the address and port of the main Odyssey Client.
   *
   * @param host The hostname to resolve to reach the Odyssey Client RPC APIs
   * @param port The port to resolve to reach the Odyssey Client RPC APIs
   * @param protocol The protocol string to use before a "://" in a request,
   * ex: "http", "https", "git", "ws", etc. Defaults to http
   * @param networkID Sets the NetworkID of the class. Default [[DefaultNetworkID]]
   * @param AChainID Sets the blockchainID for the ALPHA. Will try to auto-detect,
   * otherwise default "2eNy1mUFdmaxXNj1eQHUe7Np4gju9sJsEtWQ4MX3ToiNKuADed"
   * @param DChainID Sets the blockchainID for the DELTA. Will try to auto-detect,
   * otherwise default "2CA6j5zYzasynPsFeNoqWkmTCt3VScMvXUZHbfDJ8k3oGzAPtU"
   * @param hrp The human-readable part of the bech32 addresses
   * @param skipinit Skips creating the APIs. Defaults to false
   */
  constructor(
    host?: string,
    port?: number,
    protocol: string = "http",
    networkID: number = DefaultNetworkID,
    AChainID: string = undefined,
    DChainID: string = undefined,
    hrp: string = undefined,
    skipinit: boolean = false
  ) {
    super(host, port, protocol)
    let achainid: string = AChainID
    let dchainid: string = DChainID

    if (
      typeof AChainID === "undefined" ||
      !AChainID ||
      AChainID.toLowerCase() === "x"
    ) {
      if (networkID.toString() in Defaults.network) {
        achainid = Defaults.network[`${networkID}`].A.blockchainID
      } else {
        achainid = Defaults.network[12345].A.blockchainID
      }
    }
    if (
      typeof DChainID === "undefined" ||
      !DChainID ||
      DChainID.toLowerCase() === "c"
    ) {
      if (networkID.toString() in Defaults.network) {
        dchainid = Defaults.network[`${networkID}`].D.blockchainID
      } else {
        dchainid = Defaults.network[12345].D.blockchainID
      }
    }
    if (typeof networkID === "number" && networkID >= 0) {
      this.networkID = networkID
    } else if (typeof networkID === "undefined") {
      networkID = DefaultNetworkID
    }
    if (typeof hrp !== "undefined") {
      this.hrp = hrp
    } else {
      this.hrp = getPreferredHRP(this.networkID)
    }

    if (!skipinit) {
      this.addAPI("admin", AdminAPI)
      this.addAPI("auth", AuthAPI)
      this.addAPI("achain", ALPHAAPI, "/ext/bc/A", achainid)
      this.addAPI("dchain", DELTAAPI, "/ext/bc/D/dione", dchainid)
      this.addAPI("health", HealthAPI)
      this.addAPI("info", InfoAPI)
      this.addAPI("index", IndexAPI)
      this.addAPI("keystore", KeystoreAPI)
      this.addAPI("metrics", MetricsAPI)
      this.addAPI("ochain", OmegaVMAPI)
    }
  }
}

export { Odyssey }
export { OdysseyCore }
export { BinTools }
export { BN }
export { Buffer }
export { DB }
export { HDNode }
export { GenesisAsset }
export { GenesisData }
export { Mnemonic }
export { PubSub }
export { Socket }

export * as admin from "./apis/admin"
export * as auth from "./apis/auth"
export * as alpha from "./apis/alpha"
export * as common from "./common"
export * as delta from "./apis/delta"
export * as health from "./apis/health"
export * as index from "./apis/index"
export * as info from "./apis/info"
export * as keystore from "./apis/keystore"
export * as metrics from "./apis/metrics"
export * as omegavm from "./apis/omegavm"
export * as utils from "./utils"
