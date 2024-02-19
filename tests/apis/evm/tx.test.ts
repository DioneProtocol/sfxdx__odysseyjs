import {
  ExportTx,
  ImportTx,
  SECPTransferInput,
  TransferableInput
} from "../../../src/apis/delta"
import {
  Defaults,
  MILLIDIONE,
  OmegaChainID
} from "../../../src/utils/constants"
import { ONEDIONE } from "../../../src/utils/constants"
import { DELTAOutput } from "../../../src/apis/delta"
import BN from "bn.js"
import { BinTools, Buffer } from "src"
const networkID: number = 1337
const cHexAddress1: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const bintools: BinTools = BinTools.getInstance()
const cHexAddress2: string = "0xecC3B2968B277b837a81A7181e0b94EB1Ca54EdE"
const antAssetID: string = "F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38"
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const txID: string = "QVb7DtKjcwVYLFWHgnGSdzQtQSc29KeRBYFNCBnbFu6dFqX7z"
const blockchainID: string = Defaults.network[networkID].D.blockchainID
const sourcechainID: string = Defaults.network[networkID].A.blockchainID
let deltaOutputs: DELTAOutput[]
let importedIns: TransferableInput[]
const fee: BN = Defaults.network[networkID].D.txFee

beforeEach((): void => {
  deltaOutputs = []
  importedIns = []
})

describe("DELTA Transactions", () => {
  describe("ImportTx", () => {
    test("Multiple DIONE DELTAOutput fail", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(ONEDIONE)
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)
      // Creating 2 outputs with the same address and DIONE assetID is invalid
      let deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE,
        dioneAssetID
      )
      deltaOutputs.push(deltaOutput)
      deltaOutput = new DELTAOutput(cHexAddress1, ONEDIONE, dioneAssetID)
      deltaOutputs.push(deltaOutput)

      expect((): void => {
        new ImportTx(
          networkID,
          bintools.cb58Decode(blockchainID),
          bintools.cb58Decode(sourcechainID),
          importedIns,
          deltaOutputs
        )
      }).toThrow(
        "Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc, BUuypiq2wyuLMvyhzFXcPyxPMCgSp7eeDohhQRqTChoBjKziC)"
      )
    })

    test("Multiple DIONE DELTAOutput success", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(ONEDIONE)
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)
      // Creating 2 outputs with different addresses valid
      let deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE.div(new BN(3)),
        dioneAssetID
      )
      deltaOutputs.push(deltaOutput)
      deltaOutput = new DELTAOutput(
        cHexAddress2,
        ONEDIONE.div(new BN(3)),
        dioneAssetID
      )
      deltaOutputs.push(deltaOutput)

      const importTx: ImportTx = new ImportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        bintools.cb58Decode(sourcechainID),
        importedIns,
        deltaOutputs
      )
      expect(importTx).toBeInstanceOf(ImportTx)
      expect(importTx.getSourceChain().toString("hex")).toBe(
        bintools.cb58Decode(sourcechainID).toString("hex")
      )
    })

    test("Multiple ANT DELTAOutput fail", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(new BN(507))
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)
      // Creating 2 outputs with the same address and ANT assetID is invalid
      let deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE,
        antAssetID
      )
      deltaOutputs.push(deltaOutput)
      deltaOutput = new DELTAOutput(cHexAddress1, ONEDIONE, antAssetID)
      deltaOutputs.push(deltaOutput)
      expect((): void => {
        new ImportTx(
          networkID,
          bintools.cb58Decode(blockchainID),
          bintools.cb58Decode(sourcechainID),
          importedIns,
          deltaOutputs
        )
      }).toThrow(
        "Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc, F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38)"
      )
    })

    test("Multiple ANT DELTAOutput success", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(fee)
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)
      let deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE,
        antAssetID
      )
      deltaOutputs.push(deltaOutput)
      deltaOutput = new DELTAOutput(cHexAddress2, ONEDIONE, antAssetID)
      deltaOutputs.push(deltaOutput)

      const importTx: ImportTx = new ImportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        bintools.cb58Decode(sourcechainID),
        importedIns,
        deltaOutputs
      )
      expect(importTx).toBeInstanceOf(ImportTx)
    })

    test("Single ANT DELTAOutput fail", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(new BN(0))
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)

      // If the output is a non-dione assetID then don't subtract a fee
      const deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE,
        antAssetID
      )
      deltaOutputs.push(deltaOutput)
      const baseFee: BN = new BN(25000000000)
      expect((): void => {
        new ImportTx(
          networkID,
          bintools.cb58Decode(blockchainID),
          bintools.cb58Decode(sourcechainID),
          importedIns,
          deltaOutputs,
          baseFee
        )
      }).toThrow(
        "Error - 25000000000 nDIONE required for fee and only 0 nDIONE provided"
      )
    })

    test("Single ANT DELTAOutput success", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(ONEDIONE)
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)
      const deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE,
        antAssetID
      )
      deltaOutputs.push(deltaOutput)
      const importTx: ImportTx = new ImportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        bintools.cb58Decode(sourcechainID),
        importedIns,
        deltaOutputs
      )
      expect(importTx).toBeInstanceOf(ImportTx)
    })

    test("Single DIONE DELTAOutput fail", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(new BN(507))
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)

      const deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        new BN(0),
        dioneAssetID
      )
      deltaOutputs.push(deltaOutput)
      const baseFee: BN = new BN(25000000000)
      expect((): void => {
        new ImportTx(
          networkID,
          bintools.cb58Decode(blockchainID),
          bintools.cb58Decode(sourcechainID),
          importedIns,
          deltaOutputs,
          baseFee
        )
      }).toThrow(
        "Error - 25000000000 nDIONE required for fee and only 507 nDIONE provided"
      )
    })

    test("Single DIONE DELTAOutput success", (): void => {
      const outputidx: Buffer = Buffer.from("")
      const input: SECPTransferInput = new SECPTransferInput(ONEDIONE)
      const xferin: TransferableInput = new TransferableInput(
        bintools.cb58Decode(txID),
        outputidx,
        bintools.cb58Decode(dioneAssetID),
        input
      )
      importedIns.push(xferin)
      const deltaOutput: DELTAOutput = new DELTAOutput(
        cHexAddress1,
        ONEDIONE.sub(MILLIDIONE),
        dioneAssetID
      )
      deltaOutputs.push(deltaOutput)
      const importTx: ImportTx = new ImportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        bintools.cb58Decode(sourcechainID),
        importedIns,
        deltaOutputs
      )
      expect(importTx).toBeInstanceOf(ImportTx)
    })
  })
  describe("ExportTx", () => {
    test("getDestinationChain", (): void => {
      const exportTx: ExportTx = new ExportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        bintools.cb58Decode(OmegaChainID)
      )
      expect(exportTx).toBeInstanceOf(ExportTx)
      expect(exportTx.getDestinationChain().toString("hex")).toBe(
        bintools.cb58Decode(OmegaChainID).toString("hex")
      )
    })
  })
})
