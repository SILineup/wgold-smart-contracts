import { ethers, upgrades } from "hardhat";

async function main() {
  const cexAddress = process.env.CEX_ADDRESS;
  const Payment = await ethers.getContractFactory("Payment");
  const proxy = await upgrades.deployProxy(Payment, [cexAddress]);
  const payment = await proxy.deployed();

  await payment.deployed();
  console.log("Payment proxy deployed to:", payment.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
