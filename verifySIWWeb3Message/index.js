const { SIWWeb3 } = require("@web3auth/sign-in-with-web3");

async function verifyMessage(jsonPayload) {
  const { header,payload,signature,network } = JSON.parse(jsonPayload);
  const message = new SIWWeb3({
    header,
    payload,
    network
  });
  return await message.verify(payload, signature, network);
}

const verify = async function() {
  const isVerified = await verifyMessage(`{
    "header":{
       "t":"eip191"
    },
    "payload":{
       "domain":"localhost:1234",
       "address":"0xC3ac3a49b6f4D4221e886434496CF6F9327454d4",
       "statement":"Sign in with Ethereum to the app.",
       "uri":"http://localhost:1234",
       "version":"1",
       "chainId":1,
       "nonce":"JJ2V8kwvZZYueDLOB",
       "issuedAt": "2022-06-01T02:09:27.405Z"
    },
     "signature":{
        "s":"0xc0da894b04198482a58a5d043aa9704cdcc414371494093228a9241b0e62514c4860eb08352c37d32c13dd44a2e9d64a0652180e51fcd21b636360f5b16c64001c",
        "t":"eip191"
     },
     "network": "ethereum"
    }`)
  if (isVerified.success) {
    console.log("Verified!");
  } else {
    console.log("Not Verified!");
  }
}

verify();