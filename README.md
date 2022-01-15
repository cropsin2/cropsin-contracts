# Cropsin contracts

## Why we chose ERC1155 instead of ERC721?
Because we wan to have a single contract with NFTs from multiple artists with multiple metadata.
In another hand, we also want to mint a ERC20 kind of token that will be used to pay for the NFTs, by doing so in the same contract we are saving pretty much gas.

### Test

1. Open up a terminal and `npm run chain`
2. Open another terminal and `npm run test`




1. We need a private and public key to use as deployment account. You can create an account in Metamask or, simpler, by using https://iancoleman.io/bip39/. Once you have both keys, paste them in the .env file. (see example .env.example)
