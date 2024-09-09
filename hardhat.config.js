require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24", // Specify the Solidity compiler version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // URL of the local Hardhat network
    },
    // Uncomment and configure the following if you plan to deploy to testnets or mainnet
    // ropsten: {
    //   url: "<YOUR_INFURA_OR_ALCHEMY_URL>",
    //   accounts: [`0x${process.env.PRIVATE_KEY}`]
    // },
    // mainnet: {
    //   url: "<YOUR_INFURA_OR_ALCHEMY_URL>",
    //   accounts: [`0x${process.env.PRIVATE_KEY}`]
    // }
  },
  paths: {
    artifacts: "./artifacts", // Path to store compiled contracts
    sources: "./contracts",   // Path to your Solidity contracts
    tests: "./test",           // Path to your test files
  },
  mocha: {
    timeout: 20000 // Optional: Configure Mocha test timeout
  }
};
