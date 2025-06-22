const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy PromptTipping contract
  const PromptTipping = await ethers.getContractFactory("PromptTipping");
  const promptTipping = await PromptTipping.deploy();
  await promptTipping.deployed();
  console.log("PromptTipping deployed to:", promptTipping.address);

  // Deploy PromptVoting contract
  const PromptVoting = await ethers.getContractFactory("PromptVoting");
  const promptVoting = await PromptVoting.deploy();
  await promptVoting.deployed();
  console.log("PromptVoting deployed to:", promptVoting.address);

  // Deploy PromptPass contract
  const PromptPass = await ethers.getContractFactory("PromptPass");
  const promptPass = await PromptPass.deploy();
  await promptPass.deployed();
  console.log("PromptPass deployed to:", promptPass.address);

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("PromptTipping:", promptTipping.address);
  console.log("PromptVoting:", promptVoting.address);
  console.log("PromptPass:", promptPass.address);

  console.log("\nAdd these addresses to your .env file:");
  console.log("NEXT_PUBLIC_PROMPT_TIPPING_ADDRESS=" + promptTipping.address);
  console.log("NEXT_PUBLIC_PROMPT_VOTING_ADDRESS=" + promptVoting.address);
  console.log("NEXT_PUBLIC_PROMPT_PASS_ADDRESS=" + promptPass.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 