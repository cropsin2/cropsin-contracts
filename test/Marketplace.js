const chai = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

chai.use(solidity)
const { expect } = chai

describe("Marketplace", () => {
  let Marketplace, marketplace, Cropsin, cropsin;

  beforeEach(async () => {
    Cropsin = await ethers.getContractFactory("Cropsin");
    cropsin = await Cropsin.deploy("http://token.uri/{id}.json");
    await cropsin.deployed();

    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(cropsin.address);
    await marketplace.deployed();
  })

  describe("constructor", () => {
    it("Should set paused to false", async () => {
      expect(await marketplace.paused()).to.equal(false);
    });

    it("Should set the owner", async () => {
      const [owner] = await ethers.getSigners()

      expect(await marketplace.owner()).to.equal(owner.address);
    });
  });

  describe("pause", () => {
    it("Should set paused to true", async () => {
      await marketplace.pause()
    
      expect(await marketplace.paused()).to.equal(true);
    });

    it("Should not allow other addresses that are not the owner", async () => {
      const [owner, other] = await ethers.getSigners()

      await expect(
        marketplace.connect(other).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("unpause", () => {
    it("Should set paused to false", async () => {
      await marketplace.pause()
      await marketplace.unpause()
    
      expect(await marketplace.paused()).to.equal(false);
    });

    it("Should not allow other addresses that are not the owner", async () => {
      const [owner, other] = await ethers.getSigners()

      await expect(
        marketplace.connect(other).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("putOnSale", () => {
    let owner, approved, other;
    const quantity = 10
    const price = 5
    const tokenId = 2
  
    beforeEach(async () => {
      [owner, approved, other] = await ethers.getSigners();

      await cropsin.selfMint(quantity, 0x00)
      await cropsin.setApprovalForAll(marketplace.address, true)
    })

    describe("Ownership and approvals", async () => {
      it("Should not allow other address", async () => {
        await expect(
          marketplace.connect(other).putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
        ).to.be.revertedWith("Marketplace: caller is not ERC1155 owner nor approved");
      });

      it("Should allow an approved operator", async () => {
        await cropsin.setApprovalForAll(approved.address, true)

        await marketplace.connect(approved).putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
      });

      it("Should allow the owner of the token", async () => {
        await marketplace.connect(owner).putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
      });

      it("Should have add the current contract as a valid operator the owner of the token", async () => {
        const anotherMarketplace = await Marketplace.deploy(cropsin.address);
        await anotherMarketplace.deployed();
        await expect(
          anotherMarketplace.connect(owner).putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
        ).to.be.revertedWith("Marketplace: the marketplace contract is not added as an operator of the token");
      });
    });

    describe("Same token different accounts selling", async () => {
      it("Should define the quantity and price of the token for the given address", async () => {
        await marketplace.putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
      });

      it("Should allow to list the same token from different accounts", async () => {
        await cropsin.safeTransferFrom(owner.address, approved.address, tokenId, 5, 0x00)

        const ownerBalance = await cropsin.balanceOf(owner.address, tokenId)
        expect(ownerBalance).to.eq(5)
        const approvedBalace = await cropsin.balanceOf(approved.address, tokenId)
        expect(approvedBalace).to.eq(5)

        await marketplace.putTokenOnSaleFrom(owner.address, tokenId, 4, 6)
        
        await cropsin.connect(approved).setApprovalForAll(marketplace.address, true)
        await marketplace.connect(approved).putTokenOnSaleFrom(approved.address, tokenId, 3, 3)

        const availabilityFromOwner = await marketplace.availability(tokenId, owner.address)
        expect(availabilityFromOwner.price).to.eq(6)
        expect(availabilityFromOwner.quantity).to.eq(4)

        const availabilityFromApproved = await marketplace.availability(tokenId, approved.address)
        expect(availabilityFromApproved.price).to.eq(3)
        expect(availabilityFromApproved.quantity).to.eq(3)
      })
    });

    describe("Event", async () => {
      it("Should emit an event", async () => {
        const tx = await marketplace.putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
        const receipt = await tx.wait()
        const event = receipt.events[0]

        expect(event.event).to.equal("TokenPutOnSale")
        expect(event.args["from"]).to.equal(owner.address)
        expect(event.args["tokenId"]).to.equal(tokenId)
        expect(event.args["quantity"]).to.equal(quantity)
        expect(event.args["price"]).to.equal(price)
      })
    })

    describe("Quantities", async () => {
      it("Should not allow if the token does not exist", async () => {
        const nonExistingTokenId = 9999
        await expect(
          marketplace.putTokenOnSaleFrom(owner.address, nonExistingTokenId, quantity, price)
        ).to.be.revertedWith("Marketplace: tokenId does not exists")
      });

      it("Should not allow if the owned quantity is less than the quantity to sale", async () => {
        await expect(
          marketplace.putTokenOnSaleFrom(owner.address, tokenId, quantity + 1, price)
        ).to.be.revertedWith("Marketplace: quantity greater than allowed")
      });
    });
  });

  describe("removeFromSaleFrom", () => {
    let owner, approved, other;
    const quantity = 10
    const price = 5
    const tokenId = 2
  
    beforeEach(async () => {
      [owner, approved, other] = await ethers.getSigners();

      await cropsin.selfMint(quantity, 0x00)
      await cropsin.setApprovalForAll(marketplace.address, true)
      await marketplace.putTokenOnSaleFrom(owner.address, tokenId, quantity, price)
    })

    describe("Ownership and approvals", async () => {
      it("Should not allow other address", async () => {
        await expect(
          marketplace.connect(other).removeTokenFromSaleFrom(owner.address, tokenId)
        ).to.be.revertedWith("Marketplace: caller is not ERC1155 owner nor approved");
      });

      it("Should allow an approved operator", async () => {
        await cropsin.setApprovalForAll(approved.address, true)

        await marketplace.connect(approved).removeTokenFromSaleFrom(owner.address, tokenId)
      });

      it("Should allow the owner of the token", async () => {
        await marketplace.connect(owner).removeTokenFromSaleFrom(owner.address, tokenId)
      });
    });

    describe("Event", async () => {
      it("Should emit an event", async () => {
        const tx = await marketplace.removeTokenFromSaleFrom(owner.address, tokenId)
        const receipt = await tx.wait()
        const event = receipt.events[0]

        expect(event.event).to.equal("TokenRemovedFromSale")
        expect(event.args["from"]).to.equal(owner.address)
        expect(event.args["tokenId"]).to.equal(tokenId)
      })
    })
  });

  describe("availability", async () => {
    let owner;
    const quantity = 10;
    const price = 5;
    const tokenId = 2;
  
    beforeEach(async () => {
      [owner] = await ethers.getSigners();

      await cropsin.selfMint(quantity, 0x00)
      await cropsin.setApprovalForAll(marketplace.address, true)
    })

    it("Should return the current availability for an existing tokenId and a given token holder", async () => {
      await marketplace.putTokenOnSaleFrom(owner.address, tokenId, quantity, price)

      const availability = await marketplace.availability(tokenId, owner.address)

      expect(availability.price).to.eq(price)
      expect(availability.quantity).to.eq(quantity)
    });

    it("Should return the current availability for a non existing tokenId", async () => {
      const nonExistingTokenId = 999
      const availability = await marketplace.availability(nonExistingTokenId, owner.address)

      expect(availability.price).to.eq(0)
      expect(availability.quantity).to.eq(0)
    });

    it("Should return the current availability for removed token", async () => {
      await marketplace.putTokenOnSaleFrom(owner.address, tokenId, quantity, price)

      const availability = await marketplace.availability(tokenId, owner.address)

      expect(availability.price).to.eq(price)
      expect(availability.quantity).to.eq(quantity)

      await marketplace.removeTokenFromSaleFrom(owner.address, tokenId)
      const newAvailability = await marketplace.availability(tokenId, owner.address)

      expect(newAvailability.price).to.eq(0)
      expect(newAvailability.quantity).to.eq(0)
    });
  });
});
