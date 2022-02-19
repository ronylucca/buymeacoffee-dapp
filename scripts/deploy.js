const hre = require("hardhat");

const main = async() => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log("Deploying contract with account: ",deployer.address);
    console.log("Account balance: ", accountBalance.toString());

    const coffeeContractFactory = hre.ethers.getContractFactory("CoffeePortal");
    const coffeeContract = (await coffeeContractFactory).deploy({
        value: hre.ethers.utils.parseEther("0.01"),
    });
    (await coffeeContract).deployed();

    console.log("CoffeePortal contract address: ", (await coffeeContract).address);

};

const runMain = async() => {
    try{
        await main();
        process.exit(0);
    }catch(err){
        console.log("An error ocurr: ", err);
        process.exit(1);
    }
};

runMain();