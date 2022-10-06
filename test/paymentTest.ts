import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { utils } from "ethers";
import { Payment } from "../typechain/Payment";
import { MockToken } from "../typechain/MockToken";

describe("Payment test", function () {
  let owner: SignerWithAddress;
  let cex: SignerWithAddress;
  let payment: Payment;
  let token: MockToken;

  before(async () => {
    [owner, cex] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockToken");
    token = await Token.deploy();
    await token.deployed();
  });

  beforeEach(async () => {
    payment = await deployProxy();
  });

  const deployProxy = async (): Promise<Payment> => {
    const Payment = await ethers.getContractFactory("Payment");

    const proxy = await upgrades.deployProxy(Payment, []);

    // @ts-ignore
    return proxy;
  };
  it("should send tokens", async () => {

    let paymentProcess = {
      from: owner.address,
      to: payment.address,
      assetAddress: token.address,
      amount: utils.parseEther("1000"),
      withdrawAmount: utils.parseEther("10000"),
      orderId: 1,
      paymentId: 1,
      withdrawAddress: cex.address,
    };
    await expect(payment.processPayment(paymentProcess)).revertedWith(
      "Payment: not enough allowance"
    );
    await token.approve(payment.address, utils.parseEther("10000000"));
    await expect(payment.processPayment(paymentProcess)).revertedWith(
      "Withdraw more than amount"
    );
    paymentProcess.withdrawAmount = utils.parseEther("100");
    await payment.processPayment(paymentProcess);
    expect(await token.balanceOf(cex.address)).eq(utils.parseEther("100"));
    expect(await token.balanceOf(payment.address)).eq(utils.parseEther("900"));
  });
});
