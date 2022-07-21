import { ethers, run } from "hardhat";

async function main() {
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw Error("Please specify a contract address");
  }
  const contract = await ethers.getContractAt("WGoldManager", contractAddress);

  await run("verify:verify", {
    address: contract.address,
    constructorArguments: [],
  });
  console.log("Verify done");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
