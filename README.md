## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

```shell
$ forge build && forge test && forge create --rpc-url https://rpc-ulalo.cogitus.io/34CjKI4QNj4VJKuT12/ext/bc/WxJtVSojQ1LpPguqJCq45NZutD8T8aZpnnAZTZyfPkNKrsjye/rpc --private-key 838216c216dfc7b7a3eaea02253b134b9b40443fa549346ee3bc980d6ce9fbe8 --etherscan-api-key QKTGNT6NHAKZ1NA9WZ5JVAPB5AZH2MXUPE src/UlaloDataStore.sol:UlaloDataStore  --verify --broadcast  --constructor-args "Ulalo"
$ forge build && forge test && forge create --rpc-url https://rpc-ulalo.cogitus.io/34CjKI4QNj4VJKuT12/ext/bc/WxJtVSojQ1LpPguqJCq45NZutD8T8aZpnnAZTZyfPkNKrsjye/rpc --private-key 0xe3a990b8599f59ce4eeff769f9898442372a3b4568170431d1016b49019071ec --etherscan-api-key QKTGNT6NHAKZ1NA9WZ5JVAPB5AZH2MXUPE src/UlaloDataStore.sol:UlaloDataStore  --verify --broadcast  --constructor-args "Ulalo"
$ forge build && forge test && forge create --rpc-url https://eth-holesky.g.alchemy.com/v2/IIzRcx7GwPPTndcgjPigYZcCD83wVwPU --private-key 838216c216dfc7b7a3eaea02253b134b9b40443fa549346ee3bc980d6ce9fbe8 --etherscan-api-key QKTGNT6NHAKZ1NA9WZ5JVAPB5AZH2MXUPE src/UlaloDataStore.sol:UlaloDataStore  --verify --broadcast  --constructor-args "Ulalo"
#$ forge build && forge test && forge create --rpc-url https://eth-sepolia.g.alchemy.com/v2/IIzRcx7GwPPTndcgjPigYZcCD83wVwPU --private-key 838216c216dfc7b7a3eaea02253b134b9b40443fa549346ee3bc980d6ce9fbe8 --etherscan-api-key QKTGNT6NHAKZ1NA9WZ5JVAPB5AZH2MXUPE src/UlaloDataStore.sol:UlaloDataStore  --verify --broadcast  --constructor-args "Hello Ulalo!"
```


forge build && forge test && forge create --rpc-url https://rpc-ulalo.cogitus.io/34CjKI4QNj4VJKuT12/ext/bc/WxJtVSojQ1LpPguqJCq45NZutD8T8aZpnnAZTZyfPkNKrsjye/rpc --private-key <PRIVATE_KEY> --etherscan-api-key <ETHERSCAN_API> src/UlaloDataStore.sol:UlaloDataStore  --verify --broadcast  --constructor-args "Ulalo"

AZURE

npm install -g pm2
npm install

pm2 delete ulalo-med-contract && pm2 start app.js --name=ulalo-med-contract && pm2 startup && sudo env PATH=$PATH:/home/azureuser/.nvm/versions/node/v22.14.0/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u azureuser --hp /home/azureuser  && pm2 save


### IPFS 

https://docs.ipfs.tech/how-to/kubo-basic-cli/

forge install OpenZeppelin/openzeppelin-contracts


sausage swift knife learn list future hawk man harbor alter illegal bacon fortune silly actual impulse radio tumble equal salmon sport drop cool lend