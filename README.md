# Cropsin contracts

## Contracts

### Cropsin

_Ropsten address: [0x0cA63188F36714bEc074c493B33F5BAE6232A50d](https://ropsten.etherscan.io/address/0x0cA63188F36714bEc074c493B33F5BAE6232A50d)_

_Mumbai address: []()_

It's an Ownable ERC1155Supply contract.

**Why we chose ERC1155 instead of ERC721?**

Because we wan to have a single contract with NFTs from multiple artists with multiple metadata.

In another hand, we also want to mint a ERC20 kind of token that will be used to pay for the NFTs, by doing so in the same contract we are saving pretty much gas.

Regarding the `ERC1155Supply` extension, is important to determine if a given token exists or not, so we are inheriting that contract that allows us certain validations prior to put a token on sale.

Find a detailed spec of the ERC1155 contract [here](https://docs.openzeppelin.com/contracts/3.x/api/token/erc1155)

There are also some *Extra methods* or small changes to the Open Zeppelin implementation, those differences are the following:

`constructor`: it mints the fungible token (**CRP**) and transfers them to the owner of the contract.

`setURI(string uri)`: allows the owner of the contract to change the base URI of all the tokens. We need it just in case the centralized server gets compromised.

`mint`: creates an *amount* of new tokens under the same id (using Counter library) and sends them to the *to* address. Remember that the metadata of that contract will be retrieved from the URI of the token, just need to replace `{id}` by the actual id of the desired token.

`selfMint`: mints an *amount* of tokens to the sender of the transaction.

`fungibleTransfer`: transfers an *amount* of token id 1 (the fungible one) to the desired recipient.

`transferOwnership`: transfers the ownership of the contract to the given address and also transfers the remaining balance of the token 1 to the new owner

### Marketplace

_Ropsten address: [0xD00f38B0F02957695AFb8b701E54fac4C14d4138](https://ropsten.etherscan.io/address/0xD00f38B0F02957695AFb8b701E54fac4C14d4138)_

_Mumbai address: []()_

It's an Ownable and Pausable contract that acts as a Marketplace of _Cropsin_ tokens.

The main methods are the following:

`putTokenOnSaleFrom`: it adds the given token to the onSale list. Expects the `from` address (token holder), the `tokenId`, the `quantity` that want to be sold and the `price` per token. Take in account that the price is in CRP token. This method should be used also to update the listing, it can changes the price and quatity. IMPORTANT: make sure that the Marketplace contract has been granted as an operator of the Cropsin contract (the `setApprovalForAll({{MarketPlaceAddress}}, true)` method should have been invoked before)

`removeTokenFromSaleFrom`" it removes a token from the onSale list. Expects the `from` address (token holder) and the `tokenId`.

`availability`: expects a `tokenId` and a `tokenHolder` and returns the quantity and price available.

MISSING: `buyTokenFrom`: expects a `tokenId`, `from` address (current token holder) `quantity`. Prforms the buy/sell transaction, it transfers the `tokenId` `quantity` to the buyer and the `price` * `quantity` to the seller, also updates the onSale list of the token. IMPORTANT: (the `setApprovalForAll({{MarketPlaceAddress}}, true)` method should have been invoked before from both buyer and seller sides).


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