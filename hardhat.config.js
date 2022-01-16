/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { ROPSTEN_RPC_URL, MUMBAI_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
   solidity: "0.8.0",
   defaultNetwork: "localhost",
   networks: {
      hardhat: {},
      localhost: {
         url: 'http://localhost:8545'
      },
      mumbai: {
         url: 'https://rpc-mumbai.maticvigil.com',
         accounts: [`0x${PRIVATE_KEY}`],
         maxPriorityFeePerGas: 1999999987,
         gasPrice: 9000000000,
       },
      ropsten: {
         url: ROPSTEN_RPC_URL,
         gasPrice: 2000000000,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
}
 