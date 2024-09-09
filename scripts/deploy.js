// scripts/deploy.js
async function main() {
    // Get the contract factory
    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");

    // Deploy the contract
    console.log("Deploying MultisigWallet...");
    const multisigWallet = await MultisigWallet.deploy([/* list of initial owners */, 2]); // Pass constructor arguments if needed
    await multisigWallet.deployed();

    console.log("MultisigWallet deployed to:", multisigWallet.address);
}

// Execute the deployment script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
