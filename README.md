# Cropsin contracts

## Contracts

### Cropsin

It's an Ownable ERC1155 contract.

**Why we chose ERC1155 instead of ERC721?**

Because we wan to have a single contract with NFTs from multiple artists with multiple metadata.

In another hand, we also want to mint a ERC20 kind of token that will be used to pay for the NFTs, by doing so in the same contract we are saving pretty much gas.

*Extra methods*

`constructor`: it mints the fungible token and transfers them to the owner of the contract.

`setURI`: allows the owner of the contract to change the base URI of all the tokens. We need it just in case the centralized server gets compromised.

`mint`: creates an *amount* of new tokens under the same id (using Counter library) and sends them to the *to* address. Remember that the metadata of that contract will be retrieved from the URI of the token, just need to replace `{id}` by the actual id of the desired token.

`selfMint`: mints an *amount* of tokens to the sender of the transaction.

`fungibleTransfer`: transfers an *amount* of token id 1 (the fungible one) to the desired recipient.

`transferOwnership`: also transfers the remaining balance to the new owner


## Configure

Create a `.env` file as the following:

```
ROPSTEN_RPC_URL=you can easily create an application in Alchemy for this
MUMBAI_RPC_URL=you can easily create an application in Alchemy for this
PRIVATE_KEY=the deployer private key. REQUIRED if you want to deploy to a non local blockchain
PUBLIC_KEY=the deployer address. REQUIRED if you want to deploy to a non local blockchain
```

To create the key pair, an easy way is using https://iancoleman.io/bip39/.

## Scripts

Start local blockchain: `npm run chain` (RPC server exposed in `http://localhost:8585`)

Deploy to Ropsten (Ethereum): `npm run deploy:ropsten`

Deploy to Mumbai (Polygon): `npm run deploy:mumbai`

Run tests locally: `npm run chain` in one terminal and then `npm run test`

Deploy locally: `npm run chain` in one terminal and then `npm run deploy:local`