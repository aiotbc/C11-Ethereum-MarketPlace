module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1"
      ,port: 9545
      ,network_id: "*" // Match any network id
      // ,gasPrice: 1
      //,gas: 10721975
    }
  }
  ,compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
  // ,compilers: {
  //   solc: {
  //     // version: "0.4.25+commit.59dbf8f1.Emscripten.clang"
  //     version: "0.5.2+commit.1df8f40c.Emscripten.clang"
  //   }
  // }
};
