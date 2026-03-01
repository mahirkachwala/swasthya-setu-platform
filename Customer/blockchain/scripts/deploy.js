const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const VialLedger = await ethers.getContractFactory("VialLedger");
  const contract = await VialLedger.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("VialLedger deployed to:", address);
  console.log("\nAdd this to your Server .env:");
  console.log(`VIAL_LEDGER_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
