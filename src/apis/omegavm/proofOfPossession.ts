/**
 * @packageDocumentation
 * @module API-OmegaVM-ProofOfPossession
 */
import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()

// A BLS public key and a proof of possession of the key.
export class ProofOfPossession {
  protected _typeName = "ProofOfPossession"
  protected _typeID = undefined
  protected publidKey: Buffer = Buffer.alloc(48)
  protected signature: Buffer = Buffer.alloc(96)

  /**
   * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the publidKey
   */
  getPublidKey(): Buffer {
    return this.publidKey
  }

  /**
   * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the signature
   */
  getSignature(): Buffer {
    return this.signature
  }

  /**
  * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ProofOfPossession]], parses it, populates the class, and returns the length of the [[ProofOfPossession]] in bytes.
  *
  * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ProofOfPossession]]
  *
  * @returns The length of the raw [[ProofOfPossession]]
  *
  * @remarks assume not-checksummed
  */
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.publidKey = bintools.copyFrom(bytes, offset, offset + 48)
    offset += 48

    this.signature = bintools.copyFrom(bytes, offset, offset + 96)
    offset += 96

    return offset
  }

  /**
  * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ProofOfPossession]]
  */
  toBuffer(): Buffer {
    let bsize: number = this.publidKey.length + this.signature.length
  
    const barr: Buffer[] = [
      this.publidKey,
      this.signature
    ]
  
    return Buffer.concat(barr, bsize)
  }

  /**
   * Class representing a Proof of Possession
   *
   * @param publidKey {@link https://github.com/feross/buffer|Buffer} for the public key
   * @param signature {@link https://github.com/feross/buffer|Buffer} for the signature
   */
  constructor(publidKey: Buffer = undefined, signature: Buffer = undefined) {
    this.publidKey = publidKey
    this.signature = signature
  }
}
