const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenSupplyToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const GreenSupplyToken = await ethers.getContractFactory("GreenSupplyToken");
    token = await GreenSupplyToken.deploy(
      "GreenSupplyToken",
      "GST",
      owner.address
    );
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the correct name and symbol", async function () {
      expect(await token.name()).to.equal("GreenSupplyToken");
      expect(await token.symbol()).to.equal("GST");
    });

    it("Should have 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await token.mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should not allow non-owner to mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        token.connect(addr1).mint(addr2.address, amount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should emit TokensMinted event", async function () {
      const amount = ethers.parseEther("500");
      await expect(token.mint(addr1.address, amount))
        .to.emit(token, "TokensMinted")
        .withArgs(addr1.address, amount);
    });
  });

  describe("Burning", function () {
    it("Should allow token holder to burn their tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("300");
      
      await token.mint(addr1.address, mintAmount);
      await token.connect(addr1).burn(burnAmount);
      
      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount - burnAmount);
    });

    it("Should emit TokensBurned event", async function () {
      const mintAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("200");
      
      await token.mint(addr1.address, mintAmount);
      await expect(token.connect(addr1).burn(burnAmount))
        .to.emit(token, "TokensBurned")
        .withArgs(addr1.address, burnAmount);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("1000");
      await token.mint(owner.address, amount);
      
      await token.transfer(addr1.address, ethers.parseEther("100"));
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("900"));
    });
  });
});

