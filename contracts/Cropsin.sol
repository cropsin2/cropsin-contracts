//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Cropsin is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant ERC20_TOTAL_SUPPLY = 21000000; // TODO: Improve tokenomic :)

    // sets the sender as the owner of the contract
    // mints the supply of the ERC20 token and assigns it to the owner
    // sets uri for all the tokens
    constructor(string memory uri) ERC1155(uri) Ownable() {
        mint(_msgSender(), ERC20_TOTAL_SUPPLY, "");
    }

    // allow the owner to change all the tokens uri in case a centralized server gets compromised
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address to, uint256 amount, bytes memory data) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId, amount, data);

        return newItemId;
    }
}