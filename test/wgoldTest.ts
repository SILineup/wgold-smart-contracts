import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { WGold } from "../typechain";
import { utils } from "ethers";

describe("Wgold test", function () {
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let wgold: WGold;

  before(async () => {
    [owner, minter, burner] = await ethers.getSigners();
  });

  beforeEach(async () => {
    wgold = await deployProxy();
  });

  const deployProxy = async (): Promise<WGold> => {
    const WGold = await ethers.getContractFactory("WGold");

    const proxy = await upgrades.deployProxy(WGold, [
      minter.address,
      burner.address,
    ]);

    // @ts-ignore
    return proxy;
  };
  it("mint/burn", async () => {
    await wgold.connect(minter).mint(owner.address, utils.parseEther("100"));
    expect(await wgold.balanceOf(owner.address)).eq(utils.parseEther("100"));
    await wgold.connect(burner).burn(owner.address, utils.parseEther("100"));
    expect(await wgold.balanceOf(owner.address)).eq(0);
  });

  it("pause/unpause", async () => {
    await wgold.connect(minter).mint(owner.address, utils.parseEther("100"));
    expect(await wgold.balanceOf(owner.address)).eq(utils.parseEther("100"));
    await wgold.pause();
    await expect(
      wgold.connect(burner).burn(owner.address, utils.parseEther("100"))
    ).revertedWith("Pausable: paused");
    await wgold.unpause();
    await wgold.connect(burner).burn(owner.address, utils.parseEther("100"));
    expect(await wgold.balanceOf(owner.address)).eq(0);
  });
});
