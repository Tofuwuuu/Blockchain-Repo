const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ERC20 Token
  const GreenSupplyToken = await hre.ethers.getContractFactory("GreenSupplyToken");
  const token = await GreenSupplyToken.deploy(
    "GreenSupplyToken",
    "GST",
    deployer.address
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GreenSupplyToken deployed to:", tokenAddress);

  // Deploy ERC721 NFT
  const GreenSupplyNFT = await hre.ethers.getContractFactory("GreenSupplyNFT");
  const nft = await GreenSupplyNFT.deploy(
    "GreenSupplyNFT",
    "GSNFT",
    deployer.address
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("GreenSupplyNFT deployed to:", nftAddress);

  // Save deployment addresses
  const fs = require("fs");
  const deployments = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    token: tokenAddress,
    nft: nftAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deployments, null, 2)
  );
  
  console.log("\nDeployment addresses saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

