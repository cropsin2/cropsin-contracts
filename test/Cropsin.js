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

  it("Should have an ERC20 total supply equal to 1000000000000000000", async () => {
    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const totalSupply = await cropsin.ERC20_TOTAL_SUPPLY()
    expect(totalSupply).to.eq(1000000000000000);
  });

  it("Should have an ERC20 token id equal to 1", async () => {
    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const tokenId = await cropsin.ERC20_TOKEN_ID()
    expect(tokenId).to.eq(1);
  });
});

describe("setUri", () => {
  it("Should set the uri for all the tokens", async () => {
    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const otherUri = 'http://another.uri/{id}.json'

    await cropsin.setURI(otherUri)
    expect(await cropsin.uri(1)).to.equal(otherUri);
  });

  it("Should allow only the owner to change the uri", async () => {
    const [owner, other] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const otherUri = 'http://another.uri/{id}.json'
    await expect(
      cropsin.connect(other).setURI(otherUri)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});


describe("mint", () => {
  it("Should mint an NFT for the given address for the given amount", async () => {
    const [owner, nftOwner] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const amount = 12
    await cropsin.mint(nftOwner.address, amount, 0x00)

    const ownerBalance = await cropsin.balanceOf(nftOwner.address, 2);

    expect(ownerBalance).to.eq(amount);
  });

  it("Should mint an NFT and use the counter to set the ids", async () => {
    const [owner] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const amount = 12;
    const tx1 = await cropsin.mint(owner.address, amount, 0x00);
    const tx2 = await cropsin.mint(owner.address, amount, 0x00);

    const receipt1 = await tx1.wait();
    const args1 = receipt1.events[0].args;
    const id1 = args1["id"];
    expect(id1).to.eq(2);

    const receipt2 = await tx2.wait();
    const args2 = receipt2.events[0].args;
    const id2 = args2["id"];
    expect(id2).to.eq(3);
  });
});

describe("selfMint", () => {
  it("Should mint an NFT for the sender address", async () => {
    const [owner, nftOwner] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const amount = 12
    await cropsin.connect(nftOwner).selfMint(amount, 0x00)

    const ownerBalance = await cropsin.balanceOf(nftOwner.address, 2);

    expect(ownerBalance).to.eq(amount);
  });
});

describe("fungibleTranfer", () => {
  it("Should transfer fungible tokens to the given address", async () => {
    const [owner, contentCreator] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const amount = 100
    await cropsin.fungibleTransfer(contentCreator.address, amount)

    const contentCreatorBalance = await cropsin.balanceOf(contentCreator.address, 1);

    expect(contentCreatorBalance).to.eq(amount);
  });

  it("Should allow only the owner send fungible tokens", async () => {
    const [owner, other, contentCreator] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const amount = 100
    await expect(
      cropsin.connect(other).fungibleTransfer(contentCreator.address, amount)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});

describe("transferOwnership", () => {
  it("Should transfer all the fungible tokens to the new owner", async () => {
    const [owner, newOwner] = await ethers.getSigners();

    const Cropsin = await ethers.getContractFactory(CONTRACT_NAME);
    const cropsin = await Cropsin.deploy(TOKEN_URI);
    await cropsin.deployed();

    const totalSupply = await cropsin.ERC20_TOTAL_SUPPLY()
    const ownerInitialBalance = await cropsin.balanceOf(owner.address, 1);
    const newOwnerInitialBalance = await cropsin.balanceOf(newOwner.address, 1);

    expect(ownerInitialBalance).to.eq(totalSupply);
    expect(newOwnerInitialBalance).to.eq(0);

    await cropsin.transferOwnership(newOwner.address)

    const ownerFinalBalance = await cropsin.balanceOf(owner.address, 1);
    const newOwnerFinalBalance = await cropsin.balanceOf(newOwner.address, 1);

    expect(ownerFinalBalance).to.eq(0);
    expect(newOwnerFinalBalance).to.eq(totalSupply);

    const ownerFromContract = await cropsin.owner()

    expect(ownerFromContract).to.equal(newOwner.address)
  });
});

