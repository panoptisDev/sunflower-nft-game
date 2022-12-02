# Sunflower Land Contracts

These contracts are for educational use only. Use at your own risk.

This repo includes the contracts used in Sunflower Land along with a suite of tests.

## Prerequisites

- make
- solc (brew install solidity)
- nodejs
- docker-compose

## Getting Started with this repo

Run `make` to see full list of commands.

## Testing

1. Open docker (if not already running)
2. Start ganache - `docker-compose up eth`
3. `make test`

## Contract Addresses

FARM_CONTRACT="0x2B4A66557A79263275826AD31a4cDDc2789334bD"
INVENTORY_CONTRACT="0x22d5f9B75c524Fec1D6619787e582644CD4D7422"
TOKEN_CONTRACT="0xD1f9c58e33933a993A3891F8acFe05a68E1afC05"
BETA_CONTRACT="0x48AfE14AE52987F6fE6E2F69aB74DC7Ac5a10fd2"
SESSION_CONTRACT="0x49287922D4fe89D260C94F1a7Eb3c3FbBBc2788e"

WISHING_WELL_CONTRACT="0xBE403A6054af56629D7d591A8fBD8cce3dc66771"
          
## Architecture

Sunflower Land uses an off-chain architecture to allow players to store data off-chain without the need to transact on the Blockchain after every action.

**Data Storage**
_Contracts that hold the core data in the game_

- `Farm.sol` - NFT that is minted when starting the game
- `Token.sol` - SFL ERC20 token
- `Inventory.sol` - ERC1155 inventory of game supplies

**Orchestration**
_Contracts that mint, burn and transfer from the data storage contracts above_

- `Beta.sol` - Mint Farm NFTs during beta stage
- `Session.sol` - Session management + synchronisation of off chain data

### Off-chain syncrhonisation

The synchronisation of data is managed with 2 key concepts:

- Implicit Custody of assets
- Session Management

When a user mints a farm (Farm.sol), their NFT is assigned a unique address on the Blockchain. All tokens earnt during gameplay are sent to that address, instead of their personal wallet. A user must explicitly 'withdraw' from their NFT to gain custody of their assets. See more here - https://docs.sunflower-land.com/fundamentals/depositing-and-custody

**Validation**

`Session.sol` performs the session management. While playing the game, a user is assigned a unique session ID (see `getSessionId`). Each time the user either `syncs` or `withdraws` the game validates:

1. The session ID is the same (i.e. the user has not withdrawn any resources)
2. The caller is the owner of the NFT that holds custody of the assets
3. The transaction has been signed by our off-chain server using Open Zepellin `ECDSA` utilities.

Once a user has interacted with either `sync` or `withdraw` a new session is created.
