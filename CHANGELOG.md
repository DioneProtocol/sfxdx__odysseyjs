# CHANGELOG

## v1.7.0

### Notes

* Added Denali testnet network values
* NFTs are partially implemented in anticipation of their complete release in a future build

### Method Signature Changes

* `alpha.makeUnsignedTx`
  * Renamed to `alpha.makeBaseTx`
  * Now returns `UnsignedTx` instead of `TxUnsigned`
* `alpha.makeCreateAssetTx`
  * 4th parameter has been renamed `initialStates` from `initialState`
  * Now returns `UnsignedTx` instead of `TxCreateAsset`
* `alpha.signTx` 
  * Now accepts `UnsignedTx` instead of `TxUnsigned`
* `SelectInputClass`
  * Now accepts a `number` instead of a `Buffer`
* `alpha.getInputID`
  * Has been renamed to `alpha.getInput` and now returns an `Input` instead of a `number`

### New Methods

* `alpha.makeNFTTransferTx`

### New Classes

* alpha credentials
  * Credential
  * SecpCredential is a superset of Credential
  * NFTCredential is a superset of Credential
* alpha inputs
  * TransferableInput
  * AmountInput
* alpha ops
  * Operation
  * TransferableOperation
  * NFTTransferOperation
* alpha outputs
  * TransferableOutput
  * AmountOutput
  * SecpOutput
  * NFTOutBase
* alpha tx
  * BaseTx
  * CreateAssetTx
  * OperationTx
  * UnsignedTx
* alpha types
  * UTXOID

### New Types

* MergeRule

### Updated Classes

* Input is now `abstract`

### Deleted Classes

* alpha utxos
  * SecpUTXO
* alpha outputs
  * SecpOutBase
* alpha tx
  * TxUnsigned
  * TxCreateAsset

### New consts

* alpha credentials
  * SelectCredentialClass

### Deleted consts

* alpha utxos
  * SelectUTXOClass

### New RPC Calls

* `omega.getSubnets`
* `alpha.buildGenesis`
* `keystore.deleteUser`
