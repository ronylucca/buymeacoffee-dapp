const { expect } = require('chai')
const { ethers } = require('hardhat')

const defaultETHContract = '0.1'

describe('CoffeePortal', function () {
  it("Should create a CoffeePortal contract and return it's balance", async function () {
    const CoffeePortal = await ethers.getContractFactory('CoffeePortal')
    const coffeePortal = await CoffeePortal.deploy({
      value: ethers.utils.parseEther('0.1'),
    })
    await coffeePortal.deployed()

    expect(await ethers.provider.getBalance(coffeePortal.address)).to.equal(
      ethers.utils.parseEther('0.1')
    )
  })

  it('Should return new owner amount and same contract balance when user buys a coffee', async function () {
    const CoffeePortal = await ethers.getContractFactory('CoffeePortal')
    const coffeePortal = await CoffeePortal.deploy({
      value: ethers.utils.parseEther(defaultETHContract),
    })
    await coffeePortal.deployed()

    const [owner, addr1] = await ethers.getSigners()

    const amountBeforeCoffeeOne = await ethers.provider.getBalance(
      owner.address
    )


    //ADD NEW COFFEE
    const coffeeTxn = await coffeePortal
      .connect(addr1)
      .buyCoffee(
        'This is my first coffee',
        'Rony',
        ethers.utils.parseEther('0.001'),
        {
          value: ethers.utils.parseEther('0.001'),
        }
      )

    await coffeeTxn.wait()

    const amountAfterCofeeOne = await ethers.provider.getBalance(owner.address)

    //Total coffe is one
    expect(await coffeePortal.getTotalCoffee()).to.equal(1)

    //Contract amount isnt affected after user buy a coffee and transfer its amount to onwer.
    expect(await ethers.provider.getBalance(coffeePortal.address)).to.equal(
      ethers.utils.parseEther(defaultETHContract)
    )

    //Total Owner amount after someone buy a cofee is bigger than before
    expect(amountBeforeCoffeeOne).to.be.below(amountAfterCofeeOne)
  })
  
  it("Shouldn't permit buy a coffee using a lower amount than minimum", async function () {
    const CoffeePortal = await ethers.getContractFactory('CoffeePortal')
    const coffeePortal = await CoffeePortal.deploy({
      value: ethers.utils.parseEther(defaultETHContract),
    })
    await coffeePortal.deployed()

    //ADD NEW COFFEE
    await expect(
      coffeePortal.buyCoffee(
        'This is my first coffee',
        'Rony',
        ethers.utils.parseEther('0.0001'),
        {
          value: ethers.utils.parseEther('0.0001'),
        }
      )
    ).to.be.revertedWith('Insuficient amount for a minimum selected.')
  })
})
