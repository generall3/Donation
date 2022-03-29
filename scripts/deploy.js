const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account;", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Donation = await ethers.getContractFactory('Donation');
    const contract = await Donation.deploy();
    await contract.deployed();
    console.log('Donation deployed to:', contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });