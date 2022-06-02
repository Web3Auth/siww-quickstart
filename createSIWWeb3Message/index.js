const { Header, Payload, SIWWeb3 } = require("@web3auth/sign-in-with-web3");

const domain = "localhost";
const origin = "https://localhost/login";

function createWeb3Message(address, statement) {
  const header = new Header();
  header.t = "eip191";

  const payload = new Payload();
  payload.domain = domain;
  payload.address = address;
  payload.uri = origin;
  payload.statement = statement;
  payload.version = "1";
  payload.chainId = "1";

  const message = new SIWWeb3({
    header,
    payload,
    network: "ethereum",
  });
  return message.prepareMessage();
}

console.log(createWeb3Message("0xB22E9a1b8ee50C09a59a2fFACEeF561E9D69A493", "Hello world!"));