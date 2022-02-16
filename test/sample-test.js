const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoffeePortal", function () {
  it("Should return new instance of CoffeePortal", async function () {
    const CoffeePortal = await ethers.getContractFactory("CoffeePortal");
    const coffeePortal = await CoffeePortal.deploy();
    await coffeePortal.deployed();

    expect(await coffeePortal.getMessage()).to.equal('alive');

    const setMessageCoffeeTx = await coffeePortal.setMessage("Half Alive");

    // wait until the transaction is mined
    await setMessageCoffeeTx.wait();

    expect(await coffeePortal.getMessage()).to.equal("Half Alive");
  });
});
