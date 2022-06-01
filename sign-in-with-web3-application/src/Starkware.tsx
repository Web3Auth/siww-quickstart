import { Payload as SIWPayload, SIWWeb3 } from '@web3auth/sign-in-with-web3';
import { getStarknet } from "get-starknet";
import React, { useState } from 'react';
import { starknetKeccak } from 'starknet/dist/utils/hash';
import Swal from 'sweetalert2';
import styles from "../public/css/starkware.module.css";
import StarkwareLogo from '../public/starknet-logo.png';

const Starkware = () => {
  
  let typedMessage; 
  
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<any>();
  // Domain and origin
  const domain = window.location.host;
  const origin = window.location.origin;

  
  let statement = "Sign in with Starkware to the app.";

  const [siwsMessage, setSiwsMessage] = useState<SIWWeb3|null>();
  const [sign, setSignature] = useState("");
  const [address, setAddress] = useState("");

  async function connectWallet() {
    
    const starknet = await getStarknet()
    
    const[add] = await starknet.enable();
    if (add.length > 0) {
      setAddress(add);
      setIsConnected(true);
      setProvider(starknet);
    }
    
  }

  // Generate a message for signing
  // The nonce is generated on the server side 
  async function createStarkwareMessage() {
      const payload = new SIWPayload();
      payload.domain = domain;
      payload.address = address;
      payload.uri = origin;
      payload.statement = statement;
      payload.version = "1";
      payload.chainId = 1;
      const header = {
        t : "eip191" 
      };
      const network = "starkware"
      let message = new SIWWeb3({ header, payload, network });
      setSiwsMessage(message);
      const messageText = message.prepareMessage();
      const result = await signMessage(messageText);
      setSignature(result.join(','));
  }

  
const networkId = () => {
  const starknet = getStarknet()
  if (!starknet?.isConnected) {
    return
  }
  try {
    const { baseUrl } = starknet.provider
    if (baseUrl.includes("alpha-mainnet.starknet.io")) {
      return "mainnet-alpha"
    } else if (baseUrl.includes("alpha4.starknet.io")) {
      return "goerli-alpha"
    } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
      return "localhost"
    }
  } catch {}
}

  const signMessage = async (message:string) => {
    
    message = starknetKeccak(message).toString('hex').substring(0, 31);
    
    typedMessage = {
      domain: {
        name: "Example DApp",
        chainId: networkId() === "mainnet-alpha" ? "SN_MAIN" : "SN_GOERLI",
        version: "0.0.1",
      },
      types: {
        StarkNetDomain: [
          { name: "name", type: "felt" },
          { name: "chainId", type: "felt" },
          { name: "version", type: "felt" },
        ],
        Message: [{ name: "message", type: "felt" }],
      },
      primaryType: "Message",
      message: {
        message,
      },
    }
    
    return provider.account.signMessage(typedMessage)
  }

  return (
    <>
          {isConnected &&
              sign == "" &&
              <span>
                  <p className={styles.center}>Sign Transaction</p>
                  <input className={ styles.publicKey} type="text" id="publicKey" value={address} readOnly/>
              </span>
          }
          {
              isConnected != true &&
              sign=="" &&
              <div>
                  <div className={styles.logowrapper}>
                      <img className={styles.starkwarelogo} src={StarkwareLogo} />
                  </div>
                  <p className={styles.sign}>Sign in With Starkware</p>
              </div>
          }
                  
          {isConnected &&
              sign == "" &&
              <div>
                  <button className={styles.web3auth} id='w3aBtn' onClick={createStarkwareMessage}>Sign-in with Starkware</button>
              </div>
          }
          {isConnected != true &&
            sign == "" &&
            <button className={styles.web3auth} id='w3aBtn' onClick={connectWallet}>Connect Wallet</button>
          }

          {
              sign &&
              <>
                  <p className={styles.center}>Verify Signature</p>
                  <input className={styles.signature} type="text" id="signature" value={sign} onChange={ e=> setSignature(e.target.value)} />
                  <button className={styles.web3auth} id='verify' onClick={e => {
                      const signature = {
                          t: "eip191",
                          s: sign.split(",")
                      } 
                      const payload = siwsMessage!.payload;
                      siwsMessage!.verify(payload, signature, provider).then(resp => {
                          if (resp.success == true) {
                              Swal.fire("Success","Signature Verified","success")
                          } else {
                              Swal.fire("Error",resp.error.type,"error")
                          }
                      }).catch(err => { 
                        console.log(err)
                        Swal.fire("Error",err.error.toString(),"error")
                      });
                  }}>Verify</button>
                  <button className={styles.web3auth} id='verify' onClick={e => {
                      setSiwsMessage(null);
                      setSignature("")
                  }}>Back to Wallet</button>
              </>
          }

      </>
  );
};

export default Starkware;
