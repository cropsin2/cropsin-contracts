//Contract based on https://docs.openzeppelin.com/contracts/3.x/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Pays content creators with the fungible token (id: 1) and allow any person to create its own NFT
 */
contract Cropsin is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant ERC20_TOTAL_SUPPLY = 10**15; // TODO: Improve tokenomic :)
    uint256 public constant ERC20_TOKEN_ID = 1;

    /**
     * @dev Sets the sender as the owner of the contract, mints the
     * total supply of the ERC20 token and assigns it to the owner, and
     * sets the URI for all the tokens.
     */
    constructor(string memory uri) ERC1155(uri) Ownable() {
        mint(_msgSender(), ERC20_TOTAL_SUPPLY, "");
    }

    /**
     * @dev Allows the owner to change all the tokens uri in case a centralized server gets compromised
     */
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    /**
     * @dev Creates `amount` tokens of a new token id (using Counter library), and assigns them to `to`.
     */
    function mint(address to, uint256 amount, bytes memory data) public returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId, amount, data);

        return newItemId;
    }

    /**
     * @dev Creates `amount` tokens of a new token id (using Counter library), and assigns them to the sender.
     */
    function selfMint(uint256 amount, bytes memory data) public returns (uint256) {
        return mint(_msgSender(), amount, data);
    }

    /**
     * @dev Allows the owner of the contract to pay content creators with the fungible token
     */
    function fungibleTransfer(address to, uint256 amount) public onlyOwner {
        safeTransferFrom(_msgSender(), to, ERC20_TOKEN_ID, amount, "");
    }

    /**
     * @dev Transfers ownership and the remaining balance of the fungible token to the new owner
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        uint256 currentBalance = balanceOf(_msgSender(), ERC20_TOKEN_ID);
        fungibleTransfer(newOwner, currentBalance);
        _transferOwnership(newOwner);
    }
}