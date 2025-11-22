const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenSupplyNFT", function () {
  let nft;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const GreenSupplyNFT = await ethers.getContractFactory("GreenSupplyNFT");
    nft = await GreenSupplyNFT.deploy(
      "GreenSupplyNFT",
      "GSNFT",
      owner.address
    );
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should assign the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("GreenSupplyNFT");
      expect(await nft.symbol()).to.equal("GSNFT");
    });

    it("Should start with token ID 0", async function () {
      expect(await nft.currentTokenId()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint NFT", async function () {
      const tokenURI = "https://example.com/metadata/1";
      await nft.mint(addr1.address, tokenURI);
      
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.tokenURI(1)).to.equal(tokenURI);
      expect(await nft.currentTokenId()).to.equal(1);
    });

    it("Should not allow non-owner to mint", async function () {
      const tokenURI = "https://example.com/metadata/1";
      await expect(
        nft.connect(addr1).mint(addr2.address, tokenURI)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should emit NFTMinted event", async function () {
      const tokenURI = "https://example.com/metadata/1";
      await expect(nft.mint(addr1.address, tokenURI))
        .to.emit(nft, "NFTMinted")
        .withArgs(addr1.address, 1, tokenURI);
    });

    it("Should increment token ID for each mint", async function () {
      await nft.mint(addr1.address, "uri1");
      await nft.mint(addr2.address, "uri2");
      
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.ownerOf(2)).to.equal(addr2.address);
      expect(await nft.currentTokenId()).to.equal(2);
    });
  });

  describe("Burning", function () {
    it("Should allow owner to burn their NFT", async function () {
      const tokenURI = "https://example.com/metadata/1";
      await nft.mint(addr1.address, tokenURI);
      
      await nft.connect(addr1).burn(1);
      
      await expect(nft.ownerOf(1)).to.be.reverted;
    });

    it("Should emit NFTBurned event", async function () {
      const tokenURI = "https://example.com/metadata/1";
      await nft.mint(addr1.address, tokenURI);
      
      await expect(nft.connect(addr1).burn(1))
        .to.emit(nft, "NFTBurned")
        .withArgs(1);
    });
  });

  describe("Total Supply", function () {
    it("Should return correct total supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);
      
      await nft.mint(addr1.address, "uri1");
      await nft.mint(addr2.address, "uri2");
      
      expect(await nft.totalSupply()).to.equal(2);
    });
  });
});

