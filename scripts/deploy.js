async function main() {
  // Grab the contract factory
  const Cropsin = await ethers.getContractFactory("Cropsin");

  const TOKEN_URI = 'https://test.uri/{id}.json'
  // Start deployment, returning a promise that resolves to a contract object
  const deployed = await Cropsin.deploy(TOKEN_URI); // Instance of the contract
  console.log("Contract deployed to address:", deployed.address);
  console.log("Transaction hash", deployed.deployTransaction.hash);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });