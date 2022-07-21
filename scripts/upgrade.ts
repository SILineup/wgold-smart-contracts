const { ethers, upgrades } = require("hardhat");

async function main() {
  const contractAddress = process.env.DEPLOYED_PROXY_ADDRESS;
  if (!contractAddress) {
    throw Error("Please specify a contract address");
  }
  const contract = await ethers.getContractFactory("WGold");
  await upgrades.upgradeProxy(contractAddress, contract);
  console.log("Upgraded contract address: " + contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
