import { ethers, upgrades } from "hardhat";

async function main() {
  const WgoldManager = await ethers.getContractFactory("WGoldManager");
  const proxyManager = await upgrades.deployProxy(WgoldManager, []);
  const wgoldManager = await proxyManager.deployed();
  await wgoldManager.deployed();
  console.log("WGoldManager deployed to:", wgoldManager.address);

  console.log(
    "Waiting 30 seconds for Etherscan update before contract deployed..."
  );
  await new Promise((resolve) => setTimeout(resolve, 30000));

  const Wgold = await ethers.getContractFactory("WGold");
  const proxy = await upgrades.deployProxy(Wgold, [
    wgoldManager.address,
    wgoldManager.address,
  ]);
  const wgold = await proxy.deployed();

  await wgold.deployed();
  console.log("WGold deployed to:", wgold.address);

  await wgoldManager.setWgold(wgold.address);
  console.log("WGold address sets on WGoldManager contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
