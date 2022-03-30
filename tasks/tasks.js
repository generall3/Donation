const ethers = require("ethers");
const { task } = require("hardhat/config");
const { hrtime } = require("process");
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const contract = require("../artifacts/contracts/Donation.sol/Donation.json");
const contractAddress = "0xF444106bE0b666d7Df43dd05e9C411BEB112e839";

const infuraProvider = new ethers.providers.InfuraProvider(network = "rinkeby", INFURA_API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);
const Donation = new ethers.Contract(contractAddress, contract.abi, signer);

task("balance", "Prints a contract's balance")
    .setAction(async () => {
        let totalBalance = await Donation.getBalance();
        let totalBalanceStr = totalBalance.toString();
        console.log("Total balance: ", totalBalanceStr);
        return totalBalanceStr;
});

task("donators", "Print a contract's donators")
    .setAction(async () => {
        let donators = await Donation.getDonators();
        console.log("List of donators:", donators);
        return donators;
});

task("donatorValue", "Print an amount of currency donated by particular donator")
    .addParam("address", "Address of particular donator")
    .setAction(async (taskArgs) => {
        let donatorValue = await Donation.getDonationValue(taskArgs.address);
        let donatorValueToStr = donatorValue.toString();
        const ether = ethers.utils.formatEther(donatorValueToStr);
        console.log("Donation value of particular donator: ", ether, " ETH");
        return ether;
     });

task("sendTransaction", "Should send the transaction to contract")
     .addParam("amount", "The amount of currency to set to contract")
     .setAction(async (taskArgs, hre) => {
         let wallet = await hre.ethers.provider.getSigner();

         let tx = {
             to: contractAddress,
             value: ethers.utils.parseEther(`${taskArgs.amount}`).toHexString()
         }

         await wallet.sendTransaction(tx);
     });

task("withdraw", "Withdraw balance from contract")
     .addParam("address", "Where to withdraw withdrawal value")
     .addParam("amount", "The amount of currency to withdraw")
     .setAction(async (taskArgs, hre) => {

        const Donation = await hre.ethers.getContractAt("Donation", contractAddress);
        let amount = ethers.utils.parseEther(`${taskArgs.amount}`).toHexString();

        await Donation.withdraw(taskArgs.address, amount);
     });
