# Constants

If you run a new blockchain with a custom genesis, you should change some constants so that odysseyjs will be able to work with your blockchain. This constants are located in [constants.ts](./constants.ts).

# Example

For example, let's say we've run the blockchain with `networkID = 5`, so we change `network[5]` fields, objects `n5A`, `n5O`, `n5D`, and the variable `dioneAssetID` right before `n5A`. We might also change `hexPrivateKey` to use the new key in example scripts.

To know, which `dioneAssetID` to use, you can execute:

```bash
curl -X POST --data '{
    "jsonrpc": "2.0",
    "method": "omega.getStakingAssetID",
    "params": {
        "subnetID": "11111111111111111111111111111111LpoYY"
    },
    "id": 1
}' -H 'content-type:application/json;' 127.0.0.1:9650/ext/bc/O
```

It will return something like this:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "assetID": "2fZZYVKV6SiKgPFj6GpPMVFNeGFwp7cdb1W1hbw2sBUpQX1tMG"
  },
  "id": 1
}
```

Update `dioneAssetID = "2fZZYVKV6SiKgPFj6GpPMVFNeGFwp7cdb1W1hbw2sBUpQX1tMG"` right above `n5A` in our case.

To know, which blockchainID have chains, run:

```bash
curl -X POST --data '{
    "jsonrpc": "2.0",
    "method": "omega.getBlockchains",
    "params": {},
    "id": 1
}' -H 'content-type:application/json;' 127.0.0.1:9650/ext/bc/O
```

It will return:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "blockchains": [
      {
        "id": "49mww4UEpfsqqJPhC3XsBZYQHJ3vphg4cNwwGwj7TAyrCs16k",
        "name": "D-Chain",
        "subnetID": "11111111111111111111111111111111LpoYY",
        "vmID": "mDVBL3usiCQJx76B849LF9wjvZrwrjX1zmDwNRpPncHG2Q15B"
      },
      {
        "id": "Tv3yjrRiBDoyarcwXtezFEHaGKumWBPC5KAD3f4YEx4thhXwo",
        "name": "A-Chain",
        "subnetID": "11111111111111111111111111111111LpoYY",
        "vmID": "juZBXyHNy3HUvhBYn2SKtgm1YWyqtrq4y83o8gDJkHmzLxni2"
      }
    ]
  },
  "id": 1
}
```

We should set `n5A.blockchainID = "49mww4UEpfsqqJPhC3XsBZYQHJ3vphg4cNwwGwj7TAyrCs16k"`, `n5D.blockchainID = "Tv3yjrRiBDoyarcwXtezFEHaGKumWBPC5KAD3f4YEx4thhXwo"` and `network[5]["49mww4UEpfsqqJPhC3XsBZYQHJ3vphg4cNwwGwj7TAyrCs16k"] = n5A`, `network[5]["Tv3yjrRiBDoyarcwXtezFEHaGKumWBPC5KAD3f4YEx4thhXwo"] = n5D`.
