const { Command, InvalidOptionArgumentError } = require('commander');

const myParseInt = (value, dummyPrevious) => {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidOptionArgumentError('Not a number.');
  }
  return parsedValue;
}

const myParseUrl = (value, dummyPrevious) => {
  if (value.indexOf("http") !== 0) {
    throw new InvalidOptionArgumentError("Url doesn't start with http(s)");
  }
  return value;
}

const myParseAddress = (value, dummyPrevious) => {
  if (value.indexOf("0x") !== 0) {
    throw new InvalidOptionArgumentError("Address doesn't start with 0x");
  }
  return value;
}

const program = new Command();
program
  .requiredOption('-n, --node <string>', 'The URL for the ethereum full node', myParseUrl)
  .requiredOption('-e, --emp-address <string>', 'The ethereum address for the EMP contract to track', myParseAddress)
  .requiredOption('-t, --token-decimals <int>', 'The number of decimals the synthetic token has', myParseInt)
  .requiredOption('-c, --collateral-decimals <int>', 'The number of decimals the collateral token has', myParseInt)
  .option('-d, --discord-webhook <string>', 'The URL for the discord server webhook', myParseUrl)

program.parse(process.argv);
const options = program.opts();
exports = module.exports = options;
