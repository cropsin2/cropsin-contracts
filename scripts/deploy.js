async function main() {
  const Cropsin = await ethers.getContractFactory("Cropsin");
  const Marketplace = await ethers.getContractFactory("Marketplace");

  const TOKEN_URI = 'https://test.uri/{id}.json'

  const cropsin = await Cropsin.deploy(TOKEN_URI);
  console.log(`Cropsin contract deployed to address: ${cropsin.address}`);
  console.log(`The tx hash is ${cropsin.deployTransaction.hash}`);

  const marketplace = await Marketplace.deploy(cropsin.address);
  console.log(`Marketplace contract deployed to address: ${marketplace.address}`);
  console.log(`The tx hash is ${marketplace.deployTransaction.hash}`);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });