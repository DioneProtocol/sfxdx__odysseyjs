/**
 * @packageDocumentation
 * @module API-DELTA-ImportTx
 */

import { Buffer } from "buffer/"
import BN from "bn.js"
import BinTools from "../../utils/bintools"
import { DELTAConstants } from "./constants"
import { DELTAOutput } from "./outputs"
import { TransferableInput } from "./inputs"
import { DELTABaseTx } from "./basetx"
import { SelectCredentialClass } from "./credentials"
import { Signature, SigIdx, Credential } from "../../common/credentials"
import { StandardAmountInput } from "../../common/input"
import { KeyChain, KeyPair } from "./keychain"
import { DefaultNetworkID, Defaults } from "../../utils/constants"
import { Serialization, SerializedEncoding } from "../../utils/serialization"
import {
  ChainIdError,
  TransferableInputError,
  DELTAOutputError,
  DELTAFeeError
} from "../../utils/errors"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serializer: Serialization = Serialization.getInstance()

/**
 * Class representing an unsigned Import transaction.
 */
export class ImportTx extends DELTABaseTx {
  protected _typeName = "ImportTx"
  protected _typeID = DELTAConstants.IMPORTTX

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      sourceChain: serializer.encoder(
        this.sourceChain,
        encoding,
        "Buffer",
        "cb58"
      ),
      importIns: this.importIns.map((i) => i.serialize(encoding))
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.sourceChain = serializer.decoder(
      fields["sourceChain"],
      encoding,
      "cb58",
      "Buffer",
      32
    )
    this.importIns = fields["importIns"].map((i: object) => {
      let ii: TransferableInput = new TransferableInput()
      ii.deserialize(i, encoding)
      return ii
    })
    this.numIns = Buffer.alloc(4)
    this.numIns.writeUInt32BE(this.importIns.length, 0)
  }

  protected sourceChain: Buffer = Buffer.alloc(32)
  protected numIns: Buffer = Buffer.alloc(4)
  protected importIns: TransferableInput[] = []
  protected numOuts: Buffer = Buffer.alloc(4)
  protected outs: DELTAOutput[] = []

  /**
   * Returns the id of the [[ImportTx]]
   */
  getTxType(): number {
    return this._typeID
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} for the source chainid.
   */
  getSourceChain(): Buffer {
    return this.sourceChain
  }

  /**
   * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ImportTx]], parses it,
   * populates the class, and returns the length of the [[ImportTx]] in bytes.
   *
   * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ImportTx]]
   * @param offset A number representing the byte offset. Defaults to 0.
   *
   * @returns The length of the raw [[ImportTx]]
   *
   * @remarks assume not-checksummed
   */
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.sourceChain = bintools.copyFrom(bytes, offset, offset + 32)
    offset += 32
    this.numIns = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    const numIns: number = this.numIns.readUInt32BE(0)
    for (let i: number = 0; i < numIns; i++) {
      const anIn: TransferableInput = new TransferableInput()
      offset = anIn.fromBuffer(bytes, offset)
      this.importIns.push(anIn)
    }
    this.numOuts = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    const numOuts: number = this.numOuts.readUInt32BE(0)
    for (let i: number = 0; i < numOuts; i++) {
      const anOut: DELTAOutput = new DELTAOutput()
      offset = anOut.fromBuffer(bytes, offset)
      this.outs.push(anOut)
    }
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ImportTx]].
   */
  toBuffer(): Buffer {
    if (typeof this.sourceChain === "undefined") {
      throw new ChainIdError(
        "ImportTx.toBuffer -- this.sourceChain is undefined"
      )
    }
    this.numIns.writeUInt32BE(this.importIns.length, 0)
    this.numOuts.writeUInt32BE(this.outs.length, 0)
    let barr: Buffer[] = [super.toBuffer(), this.sourceChain, this.numIns]
    let bsize: number =
      super.toBuffer().length + this.sourceChain.length + this.numIns.length
    this.importIns = this.importIns.sort(TransferableInput.comparator())
    this.importIns.forEach((importIn: TransferableInput) => {
      bsize += importIn.toBuffer().length
      barr.push(importIn.toBuffer())
    })
    bsize += this.numOuts.length
    barr.push(this.numOuts)
    this.outs.forEach((out: DELTAOutput) => {
      bsize += out.toBuffer().length
      barr.push(out.toBuffer())
    })
    return Buffer.concat(barr, bsize)
  }

  /**
   * Returns an array of [[TransferableInput]]s in this transaction.
   */
  getImportInputs(): TransferableInput[] {
    return this.importIns
  }

  /**
   * Returns an array of [[DELTAOutput]]s in this transaction.
   */
  getOuts(): DELTAOutput[] {
    return this.outs
  }

  clone(): this {
    let newImportTx: ImportTx = new ImportTx()
    newImportTx.fromBuffer(this.toBuffer())
    return newImportTx as this
  }

  create(...args: any[]): this {
    return new ImportTx(...args) as this
  }

  /**
   * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
   *
   * @param msg A Buffer for the [[UnsignedTx]]
   * @param kc An [[KeyChain]] used in signing
   *
   * @returns An array of [[Credential]]s
   */
  sign(msg: Buffer, kc: KeyChain): Credential[] {
    const creds: Credential[] = super.sign(msg, kc)
    this.importIns.forEach((importIn: TransferableInput) => {
      const cred: Credential = SelectCredentialClass(
        importIn.getInput().getCredentialID()
      )
      const sigidxs: SigIdx[] = importIn.getInput().getSigIdxs()
      sigidxs.forEach((sigidx: SigIdx) => {
        const keypair: KeyPair = kc.getKey(sigidx.getSource())
        const signval: Buffer = keypair.sign(msg)
        const sig: Signature = new Signature()
        sig.fromBuffer(signval)
        cred.addSignature(sig)
      })
      creds.push(cred)
    })
    return creds
  }

  /**
   * Class representing an unsigned Import transaction.
   *
   * @param networkID Optional networkID, [[DefaultNetworkID]]
   * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
   * @param sourceChainID Optional chainID for the source inputs to import. Default Buffer.alloc(32, 16)
   * @param importIns Optional array of [[TransferableInput]]s used in the transaction
   * @param outs Optional array of the [[DELTAOutput]]s
   * @param fee Optional the fee as a BN
   */
  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    sourceChainID: Buffer = Buffer.alloc(32, 16),
    importIns: TransferableInput[] = undefined,
    outs: DELTAOutput[] = undefined,
    fee: BN = new BN(0)
  ) {
    super(networkID, blockchainID)
    this.sourceChain = sourceChainID
    let inputsPassed: boolean = false
    let outputsPassed: boolean = false
    if (
      typeof importIns !== "undefined" &&
      Array.isArray(importIns) &&
      importIns.length > 0
    ) {
      importIns.forEach((importIn: TransferableInput) => {
        if (!(importIn instanceof TransferableInput)) {
          throw new TransferableInputError(
            "Error - ImportTx.constructor: invalid TransferableInput in array parameter 'importIns'"
          )
        }
      })
      inputsPassed = true
      this.importIns = importIns
    }
    if (typeof outs !== "undefined" && Array.isArray(outs) && outs.length > 0) {
      outs.forEach((out: DELTAOutput) => {
        if (!(out instanceof DELTAOutput)) {
          throw new DELTAOutputError(
            "Error - ImportTx.constructor: invalid DELTAOutput in array parameter 'outs'"
          )
        }
      })
      if (outs.length > 1) {
        outs = outs.sort(DELTAOutput.comparator())
      }
      outputsPassed = true
      this.outs = outs
    }
    if (inputsPassed && outputsPassed) {
      this.validateOuts(fee)
    }
  }

  private validateOuts(fee: BN): void {
    // This Map enforces uniqueness of pair(address, assetId) for each DELTAOutput.
    // For each imported assetID, each ETH-style D-Chain address can
    // have exactly 1 DELTAOutput.
    // Map(2) {
    //   '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC' => [
    //     'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
    //     'F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38'
    //   ],
    //   '0xecC3B2968B277b837a81A7181e0b94EB1Ca54EdE' => [
    //     'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
    //     '2Df96yHyhNc3vooieNNhyKwrjEfTsV2ReMo5FKjMpr8vwN4Jqy',
    //     'SfSXBzDb9GZ9R2uH61qZKe8nxQHW9KERW9Kq9WRe4vHJZRN3e'
    //   ]
    // }
    const seenAssetSends: Map<string, string[]> = new Map()
    this.outs.forEach((deltaOutput: DELTAOutput): void => {
      const address: string = deltaOutput.getAddressString()
      const assetId: string = bintools.cb58Encode(deltaOutput.getAssetID())
      if (seenAssetSends.has(address)) {
        const assetsSentToAddress: string[] = seenAssetSends.get(address)
        if (assetsSentToAddress.includes(assetId)) {
          const errorMessage: string = `Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x${address}, ${assetId})`
          throw new DELTAOutputError(errorMessage)
        }
        assetsSentToAddress.push(assetId)
      } else {
        seenAssetSends.set(address, [assetId])
      }
    })
    // make sure this transaction pays the required dione fee
    const selectedNetwork: number = this.getNetworkID()
    const feeDiff: BN = new BN(0)
    const dioneAssetID: string =
      Defaults.network[`${selectedNetwork}`].A.dioneAssetID
    // sum incoming DIONE
    this.importIns.forEach((input: TransferableInput): void => {
      // only check StandardAmountInputs
      if (
        input.getInput() instanceof StandardAmountInput &&
        dioneAssetID === bintools.cb58Encode(input.getAssetID())
      ) {
        const ui = input.getInput() as unknown
        const i = ui as StandardAmountInput
        feeDiff.iadd(i.getAmount())
      }
    })
    // subtract all outgoing DIONE
    this.outs.forEach((deltaOutput: DELTAOutput): void => {
      if (dioneAssetID === bintools.cb58Encode(deltaOutput.getAssetID())) {
        feeDiff.isub(deltaOutput.getAmount())
      }
    })
    if (feeDiff.lt(fee)) {
      const errorMessage: string = `Error - ${fee} nDIONE required for fee and only ${feeDiff} nDIONE provided`
      throw new DELTAFeeError(errorMessage)
    }
  }
}
