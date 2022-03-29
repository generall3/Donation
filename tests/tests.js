const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donation", function () {
  let owner, addr1;

  before(async function () {
    this.Donation = await ethers.getContractFactory('Donation');
  });

  beforeEach(async function () { 
    [owner, addr1] = await ethers.getSigners();
    this.contract = await this.Donation.deploy();
    await this.contract.deployed();
  })

  // Test case
  it('Owner should be set correctly', async function () {
    expect((await this.contract.owner())).to.equal(owner.address);
  });

  it("If donation value equal to 0, should revert", async function () {
    let donation = {
      to: this.contract.address,
      value: await ethers.utils.parseEther("0")
    };

    await expect(addr1.sendTransaction(donation)).to.be.revertedWith("Donation value is equal to zero");

    await expect(await this.contract.getDonationValue(addr1.address)).to.equal(0);

    await expect(await this.contract.getDonators()).to.deep.equal([]);

    await expect(await this.contract.getBalance()).to.equal(0);
  });

  it("If donation correct, balance, donations mapping and donators are refreshed", async function() {
    let donation = {
      to: this.contract.address,
      value: await ethers.utils.parseEther("1")
    };

    await addr1.sendTransaction(donation);

    await expect(await this.contract.getDonationValue(addr1.address)).to.equal(donation.value);

    let donators = await this.contract.getDonators();
    await expect(donators[0]).to.equal(addr1.address);

    await expect(await this.contract.getBalance()).to.equal(donation.value);
  });

  it("Should not be any duplicate donator in donators array", async function() {
    let donation = {
      to: this.contract.address,
      value: await ethers.utils.parseEther("1")
    };

    await addr1.sendTransaction(donation);

    let donators = await this.contract.getDonators();
    await expect(donators[0]).to.equal(addr1.address);
    await expect(donators[1]).to.equal(undefined);
  });

  it("Different transactions should change totalBalance", async function() {
    let donation = {
      to: this.contract.address,
      value: await ethers.utils.parseEther("1")
    };

    await addr1.sendTransaction(donation);
    donation.value = await ethers.utils.parseEther("1");
    await addr1.sendTransaction(donation);
    let sumOfDonationsValue = await ethers.utils.parseEther("2");

    await expect(await this.contract.getBalance()).to.equal(sumOfDonationsValue);
  });

  it("DonationReceived event emitted correctly", async function() {
    let donation = {
      to: this.contract.address,
      value: await ethers.utils.parseEther("1")
    };

    await expect(await addr1.sendTransaction(donation))
      .to.emit(this.contract, "DonationReceived")
      .withArgs(addr1.address, donation.value);
  });

  it("Withdrawing works correctly (owner balance and contracts totalBalance refreshes", async function() {
    let donation = {
      to: this.contract.address,
      value: await ethers.utils.parseEther("2")
    };
    let oneEther = await ethers.utils.parseEther("1");

    await addr1.sendTransaction(donation);

    await expect(await this.contract.withdraw(owner.address, oneEther)).to.changeEtherBalance(owner, oneEther);

    await expect(await this.contract.getBalance()).to.equal(oneEther);
  });

  it("Only owner can call function", async function() {
    await expect(this.contract.connect(addr1).withdraw(addr1.address, 1)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("If totalBalance is less than withdrawal value, revert", async function() {
    await expect(this.contract.withdraw(owner.address, 100)).to.be.revertedWith("Withdrawal value is greater than total balance");
  });
});