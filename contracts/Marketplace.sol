// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Cropsin.sol";

/**
 * 
 */
contract Marketplace is Pausable, Ownable {

  /**
   * @dev Emitted when `quantity` tokens of token `tokenId` are put on sake from `from` at a price `price`.
   */
  event TokenPutOnSale(address indexed from, uint256 tokenId, uint256 quantity, uint256 price);

  struct OnSaleToken {
    uint256 quantity;
    uint256 price;
  }

  /**
   * Mapping from token id to account address to OnSaleToken
   */
  mapping(uint256 => mapping(address => OnSaleToken)) public _onSaleTokens;

  Cropsin cropsin;
  
  constructor(Cropsin _cropsin) Pausable() Ownable() {
    cropsin = _cropsin;
  }

  modifier onlyOwnerOrApprovedOperator (address from) {
    require(from == _msgSender() || cropsin.isApprovedForAll(from, _msgSender()), "Marketplace: caller is not ERC1155 owner nor approved");
    _;
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function putTokenOnSaleFrom(address from, uint256 tokenId, uint256 quantity, uint256 price)
    onlyOwnerOrApprovedOperator(from) public {
      require(cropsin.exists(tokenId), "Marketplace: tokenId does not exists");
      require(cropsin.balanceOf(from, tokenId) >= quantity, "Marketplace: quantity greater than allowed");

      _onSaleTokens[tokenId][from] = OnSaleToken(quantity, price);

      emit TokenPutOnSale(from, tokenId, quantity, price); // test
  }

  function availability(uint256 tokenId, address from) public view returns (OnSaleToken memory) {
    return _onSaleTokens[tokenId][from];
  }
}
