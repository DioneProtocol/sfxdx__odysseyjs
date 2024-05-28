import BN from "bn.js"
import BinTools from "../../utils/bintools"
import { BaseTx } from "./basetx"
import { TransferableOutput } from "../omegavm/outputs"
import { TransferableInput } from "../omegavm/inputs"
import { Buffer } from "buffer/"
import { OmegaVMConstants } from "./constants"
import { DefaultNetworkID } from "../../utils/constants"
import { bufferToNodeIDString } from "../../utils/helperfunctions"
import { AmountOutput, ParseableOutput } from "./outputs"
import { SelectCredentialClass, SubnetAuth } from "."
import { Credential, SigIdx, Signature } from "../../common/credentials"
import { Serialization, SerializedEncoding, SerializedType } from "../../utils/serialization"
import { DelegationFeeError } from "../../utils/errors"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

/**
 * Abstract class representing an transactions with validation information.
 */
export abstract class TransformSubnetTx extends BaseTx {
  protected _typeName = "TransformSubnetTx"
  protected _typeID = OmegaVMConstants.TRANSFORMSUBNETTX

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
    //   subnetID: serialization.encoder(this.subnetID, encoding, "Buffer", "cb58"),
    //   startTime: serialization.encoder(
    //     this.startTime,
    //     encoding,
    //     "Buffer",
    //     "decimalString"
    //   ),
    //   endTime: serialization.encoder(
    //     this.endTime,
    //     encoding,
    //     "Buffer",
    //     "decimalString"
    //   )
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    // this.nodeID = serialization.decoder(
    //   fields["nodeID"],
    //   encoding,
    //   "nodeID",
    //   "Buffer",
    //   20
    // )
    // this.startTime = serialization.decoder(
    //   fields["startTime"],
    //   encoding,
    //   "decimalString",
    //   "Buffer",
    //   8
    // )
    // this.endTime = serialization.decoder(
    //   fields["endTime"],
    //   encoding,
    //   "decimalString",
    //   "Buffer",
    //   8
    // )
  }

  protected subnetID: Buffer = Buffer.alloc(32)
  protected assetID: Buffer = Buffer.alloc(OmegaVMConstants.ASSETIDLEN)
  protected initialSupply: Buffer = Buffer.alloc(8)
  protected maximumSupply: Buffer = Buffer.alloc(8)
  protected minConsumptionRate: Buffer = Buffer.alloc(8)
  protected maxConsumptionRate: Buffer = Buffer.alloc(8)
  protected minValidatorStake: Buffer = Buffer.alloc(8)
  protected maxValidatorStake: Buffer = Buffer.alloc(8)
  protected minValidatorStakeDuration: Buffer = Buffer.alloc(4)
  protected maxValidatorStakeDuration: Buffer = Buffer.alloc(4)
  protected minDelegatorStakeDuration: Buffer = Buffer.alloc(4)
  protected maxDelegatorStakeDuration: Buffer = Buffer.alloc(4)
  protected minDelegationFee: Buffer = Buffer.alloc(4)
  protected minDelegatorStake: Buffer = Buffer.alloc(8)
  protected maxValidatorWeightFactor: Buffer = Buffer.alloc(1)
  protected uptimeRequirement: Buffer = Buffer.alloc(4)
  protected subnetAuth: SubnetAuth
  protected sigCount: Buffer = Buffer.alloc(4)
  protected sigIdxs: SigIdx[] = [] // idxs of subnet auth signers

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.subnetID = bintools.copyFrom(bytes, offset, offset + 32)
    offset += 32
    this.assetID = bintools.copyFrom(bytes, offset, offset + OmegaVMConstants.ASSETIDLEN)
    offset += OmegaVMConstants.ASSETIDLEN
    this.initialSupply = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.maximumSupply = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.minConsumptionRate = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.maxConsumptionRate = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.minValidatorStake = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.maxValidatorStake = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.minValidatorStakeDuration = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.maxValidatorStakeDuration = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.minDelegatorStakeDuration = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.maxDelegatorStakeDuration = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.minDelegationFee = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.minDelegatorStake = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.maxValidatorWeightFactor = bintools.copyFrom(bytes, offset, offset + 1)
    offset += 1
    this.uptimeRequirement = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4

    const sa: SubnetAuth = new SubnetAuth()
    offset += sa.fromBuffer(bintools.copyFrom(bytes, offset))
    this.subnetAuth = sa
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ValidatorTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    const bsize: number =
      superbuff.length +
      this.subnetID.length +
      this.assetID.length +
      this.initialSupply.length +
      this.maximumSupply.length +
      this.minConsumptionRate.length +
      this.maxConsumptionRate.length +
      this.minValidatorStake.length +
      this.maxValidatorStake.length +
      this.minValidatorStakeDuration.length +
      this.maxValidatorStakeDuration.length +
      this.minDelegatorStakeDuration.length +
      this.maxDelegatorStakeDuration.length +
      this.minDelegationFee.length +
      this.minDelegatorStake.length +
      this.maxValidatorWeightFactor.length +
      this.uptimeRequirement.length

      const barr: Buffer[] = [
        superbuff,
        this.subnetID,
        this.assetID,
        this.initialSupply,
        this.maximumSupply,
        this.minConsumptionRate,
        this.maxConsumptionRate,
        this.minValidatorStake,
        this.maxValidatorStake,
        this.minValidatorStakeDuration,
        this.maxValidatorStakeDuration,
        this.minDelegatorStakeDuration,
        this.maxDelegatorStakeDuration,
        this.minDelegationFee,
        this.minDelegatorStake,
        this.maxValidatorWeightFactor,
        this.uptimeRequirement,
        this.subnetAuth.toBuffer()
      ]
      return Buffer.concat(barr, bsize)
  }

  /**
   * Creates and adds a [[SigIdx]] to the [[TransformSubnetTx]].
   *
   * @param addressIdx The index of the address to reference in the signatures
   * @param address The address of the source of the signature
   */
  addSignatureIdx(addressIdx: number, address: Buffer): void {
    const addressIndex: Buffer = Buffer.alloc(4)
    addressIndex.writeUIntBE(addressIdx, 0, 4)
    this.subnetAuth.addAddressIndex(addressIndex)

    const sigidx: SigIdx = new SigIdx()
    const b: Buffer = Buffer.alloc(4)
    b.writeUInt32BE(addressIdx, 0)
    sigidx.fromBuffer(b)
    sigidx.setSource(address)
    this.sigIdxs.push(sigidx)
    this.sigCount.writeUInt32BE(this.sigIdxs.length, 0)
  }

  constructor(
    networkID: number,
    blockchainID: Buffer,
    outs: TransferableOutput[],
    ins: TransferableInput[],
    memo?: Buffer,
    subnetID: string | Buffer,
    assetID: string | Buffer,
    initialSupply: BN,
    maximumSupply: BN,
    minConsumptionRate: BN,
    maxConsumptionRate: BN,
    minValidatorStake: BN,
    maxValidatorStake: BN,
    minValidatorStakeDuration: BN,
    maxValidatorStakeDuration: BN,
    minDelegatorStakeDuration: BN,
    maxDelegatorStakeDuration: BN,
    minDelegationFee: BN,
    minDelegatorStake: BN,
    maxValidatorWeightFactor: BN,
    uptimeRequirement: BN
  ) {
    super(networkID, blockchainID, outs, ins, memo)
    if (typeof subnetID != "undefined") {
        if (typeof subnetID === "string") {
          this.subnetID = bintools.cb58Decode(subnetID)
        } else {
          this.subnetID = subnetID
        }
    }
    if (typeof assetID != "undefined") {
        if (typeof assetID === "string") {
          this.assetID = bintools.cb58Decode(assetID)
        } else {
          this.assetID = assetID
        }
    }
    this.initialSupply = bintools.fromBNToBuffer(initialSupply, 8)
    this.maximumSupply = bintools.fromBNToBuffer(maximumSupply, 8)
    this.minConsumptionRate = bintools.fromBNToBuffer(minConsumptionRate, 8)
    this.maxConsumptionRate = bintools.fromBNToBuffer(maxConsumptionRate, 8)
    this.minValidatorStake = bintools.fromBNToBuffer(minValidatorStake, 8)
    this.maxValidatorStake = bintools.fromBNToBuffer(maxValidatorStake, 8)
    this.minValidatorStakeDuration = bintools.fromBNToBuffer(minValidatorStakeDuration, 4)
    this.maxValidatorStakeDuration = bintools.fromBNToBuffer(maxValidatorStakeDuration, 4)
    this.minDelegatorStakeDuration = bintools.fromBNToBuffer(minDelegatorStakeDuration, 4)
    this.maxDelegatorStakeDuration = bintools.fromBNToBuffer(maxDelegatorStakeDuration, 4)
    this.minDelegationFee = bintools.fromBNToBuffer(minDelegationFee, 4)
    this.minDelegatorStake = bintools.fromBNToBuffer(minDelegatorStake, 8)
    this.maxValidatorWeightFactor = bintools.fromBNToBuffer(maxValidatorWeightFactor, 1)
    this.uptimeRequirement = bintools.fromBNToBuffer(uptimeRequirement, 4)

    const subnetAuth: SubnetAuth = new SubnetAuth()
    this.subnetAuth = subnetAuth
  }
}