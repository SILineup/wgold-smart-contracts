import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { utils } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { MockToken, WGold, WGoldManager, Payment } from "../typechain";

describe("General test", function () {
  let owner: SignerWithAddress;
  let cex: SignerWithAddress;
  let payment: Payment;
  let wgold: WGold;
  let wGoldManager: WGoldManager;
  let token: MockToken;

  before(async () => {
    [owner, cex] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockToken");
    token = await Token.deploy();
    await token.deployed();
  });

  beforeEach(async () => {
    payment = await deployPayment();
    wGoldManager = await deployManager();
    wgold = await deployGold(wGoldManager.address, wGoldManager.address);
    await wGoldManager.setWgold(wgold.address);
  });

  const deployPayment = async (): Promise<Payment> => {
    const Payment = await ethers.getContractFactory("Payment");

    const proxy = await upgrades.deployProxy(Payment, []);

    // @ts-ignore
    return proxy;
  };

  const deployGold = async (minter: string, burner: string): Promise<WGold> => {
    const Wgold = await ethers.getContractFactory("WGold");

    const proxy = await upgrades.deployProxy(Wgold, [minter, burner]);

    // @ts-ignore
    return proxy;
  };

  const deployManager = async (): Promise<WGoldManager> => {
    const Manager = await ethers.getContractFactory("WGoldManager");

    const proxy = await upgrades.deployProxy(Manager, []);

    // @ts-ignore
    return proxy;
  };
  it("sign data and pausable check", async () => {
    let paymentProcess = {
      from: owner.address,
      to: payment.address,
      assetAddress: token.address,
      amount: utils.parseEther("1000"),
      withdrawAmount: utils.parseEther("100"),
      orderId: 1,
      paymentId: 1,
      withdrawAddress: cex.address,
    };

    let taskInfo = {
      from: owner.address,
      amount: utils.parseEther("1000"),
      orderId: 1,
    };
    await expect(payment.processPayment(paymentProcess)).revertedWith(
      "Payment: not enough allowance"
    );
    await token.approve(payment.address, utils.parseEther("10000000"));
    await payment.processPayment(paymentProcess);
    expect(await token.balanceOf(cex.address)).eq(utils.parseEther("100"));
    expect(await token.balanceOf(payment.address)).eq(utils.parseEther("900"));

    const types = {
      TaskInfo: [
        { name: "from", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "orderId", type: "uint256" },
      ],
    };

    const { chainId } = await ethers.provider.getNetwork();

    const domain = {
      name: "manager",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: wGoldManager.address,
    };
    const signedMessage = await owner._signTypedData(domain, types, taskInfo);
    await wGoldManager.mintGold(taskInfo, signedMessage);
    await wGoldManager.burnGold(taskInfo, signedMessage);

    // pause/unpause
    await wGoldManager.pause();
    await expect(wGoldManager.mintGold(taskInfo, signedMessage)).revertedWith(
      "Pausable: paused"
    );
    await wGoldManager.unpause();
    await wGoldManager.mintGold(taskInfo, signedMessage);
  });
});
