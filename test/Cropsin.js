const chai = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

chai.use(solidity)
const { expect } = chai

const TOKEN_URI = "https://this.is.a.test/{id}.json"
const CONTRACT_NAME = "Cropsin"

describe("constructor", () => {
  it("Should set the uri for all the tokens whe deploying", async () => {
    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    expect(await cropsin.uri(1)).to.equal(TOKEN_URI);
  });

  it("Should return the deployment address as the owner", async () => {
    const [owner] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    expect(await cropsin.owner()).to.equal(owner.address);
  });

  it("Should mint the total supply of the ERC20 token", async () => {
    const [owner] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const ownerBalance = await cropsin.balanceOf(owner.address, 1);
    const totalSupply = await cropsin.ERC20_TOTAL_SUPPLY()
    expect(ownerBalance).to.eq(totalSupply);
  });

  it("Should have an ERC20 total supply equal to 21000000", async () => {
    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const totalSupply = await cropsin.ERC20_TOTAL_SUPPLY()
    expect(totalSupply).to.eq(21000000);
  });
});
