async function main() {
  // Grab the contract factory
  const Cropsin = await ethers.getContractFactory("Cropsin");

  // Start deployment, returning a promise that resolves to a contract object
  const deployed = await Cropsin.deploy(); // Instance of the contract
  console.log("Contract deployed to address:", deployed.address);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });