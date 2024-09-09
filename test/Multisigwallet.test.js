const { expect } = require("chai");

describe("MultisigWallet", function () {
    let MultisigWallet;
    let multisigWallet;
    let owner1, owner2, nonOwner;

    beforeEach(async function () {
        [owner1, owner2, nonOwner] = await ethers.getSigners();
        MultisigWallet = await ethers.getContractFactory("MultisigWallet");
        multisigWallet = await MultisigWallet.deploy([owner1.address, owner2.address], 2);
        await multisigWallet.deployed();
    });

    it("should deploy correctly", async function () {
        expect(await multisigWallet.requiredSignatures()).to.equal(2);
    });

    it("should allow owners to submit transactions", async function () {
        await multisigWallet.connect(owner1).submitTransaction(owner2.address, ethers.utils.parseEther("1"));
        const transaction = await multisigWallet.transactions(0);
        expect(transaction.destination).to.equal(owner2.address);
    });

    it("should require confirmations before executing", async function () {
        await multisigWallet.connect(owner1).submitTransaction(owner2.address, ethers.utils.parseEther("1"));
        await multisigWallet.connect(owner1).confirmTransaction(0);
        await expect(multisigWallet.connect(owner1).executeTransaction(0)).to.be.revertedWith("Not enough confirmations");
    });

    it("should execute a transaction after sufficient confirmations", async function () {
        await multisigWallet.connect(owner1).submitTransaction(owner2.address, ethers.utils.parseEther("1"));
        await multisigWallet.connect(owner1).confirmTransaction(0);
        await multisigWallet.connect(owner2).confirmTransaction(0);
        await expect(multisigWallet.connect(owner1).executeTransaction(0)).to.not.be.reverted;
    });

    // Additional tests
    it("should not allow non-owners to submit transactions", async function () {
        await expect(multisigWallet.connect(nonOwner).submitTransaction(owner2.address, ethers.utils.parseEther("1"))).to.be.revertedWith("Not an owner");
    });

    it("should not allow the same transaction to be submitted twice", async function () {
        await multisigWallet.connect(owner1).submitTransaction(owner2.address, ethers.utils.parseEther("1"));
        await expect(multisigWallet.connect(owner1).submitTransaction(owner2.address, ethers.utils.parseEther("1"))).to.be.revertedWith("Transaction already exists");
    });
});
