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
   * @dev Emitted when `quantity` tokens of token `tokenId` are put on sale from `from` at a price `price`.
   */
  event TokenPutOnSale(address indexed from, uint256 tokenId, uint256 quantity, uint256 price);

  /**
   * @dev Emitted when token `tokenId` is removed from the sale list of `from`
   */
  event TokenRemovedFromSale(address indexed from, uint256 tokenId);

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

  // should be used to update as well, for instance: if wants to change the price or the quantity
  function putTokenOnSaleFrom(address from, uint256 tokenId, uint256 quantity, uint256 price)
    onlyOwnerOrApprovedOperator(from) public {
      require(cropsin.exists(tokenId), "Marketplace: tokenId does not exists");
      require(cropsin.balanceOf(from, tokenId) >= quantity, "Marketplace: quantity greater than allowed");
      require(cropsin.isApprovedForAll(from, address(this)), "Marketplace: the marketplace contract is not added as an operator of the token");

      _onSaleTokens[tokenId][from] = OnSaleToken(quantity, price);

      emit TokenPutOnSale(from, tokenId, quantity, price);
  }

  function removeTokenFromSaleFrom(address from, uint256 tokenId)
    onlyOwnerOrApprovedOperator(from) public {
      delete _onSaleTokens[tokenId][from];

      emit TokenRemovedFromSale(from, tokenId);
  }

  function availability(uint256 tokenId, address from) public view returns (OnSaleToken memory) {
    return _onSaleTokens[tokenId][from];
  }
}
