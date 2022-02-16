
const hre = require("hardhat");

const main = async() => {

    const coffeeContractFactory = await hre.ethers.getContractFactory('CoffeePortal');
    const coffeeContract = await coffeeContractFactory.deploy();

    await coffeeContract.deployed();
    console.log('Coffee Contract has been successfully deployed to : ', coffeeContract.address);
}

const runMain = async () => {
    try{
        await main();
        process.exit(0);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

runMain();