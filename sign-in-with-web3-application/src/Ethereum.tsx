import { Payload as SIWPayload, SIWWeb3 } from '@web3auth/sign-in-with-web3';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Web3 from 'web3';
import styles from '../public/css/ethereum.module.css';
import EthereumLogo from '../public/ethereum-logo.png';

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

const Ethereum: React.FC = () => {

    const [siwwMessage, setSiwwMessage] = useState<SIWWeb3|null>();
    const [sign, setSignature] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [currentProvider, setProvider] = useState<any>();
  
    // Domain and origin
    const domain = window.location.host;
    const origin = window.location.origin;

    let statement = "Sign in with Ethereum to the app.";

    const detectCurrentProvider = () => {
        let provider;
        if (window.ethereum) {
          provider = window.ethereum;
        } else if (window.web3) {
          provider = window.web3.currentProvider;
        } else {
          console.log(
            'Non-Ethereum browser detected. You should consider trying MetaMask!'
          );
        }
        return provider;
      };

    async function connectWallet() {
        try {
            setProvider(detectCurrentProvider());
            if (currentProvider) {
              if (currentProvider !== window.ethereum) {
                  Swal.fire(
                  'Non-Ethereum browser detected. You should consider trying MetaMask!'
                );
              }
              await currentProvider.request({ method: 'eth_requestAccounts' });
              const web3 = new Web3(currentProvider);
              const userAccount = await web3.eth.getAccounts();
              if (userAccount.length === 0) {
                console.log('Please connect to meta mask');
              } else {
                setPublicKey(userAccount[0])
              }
            }
          } catch (err) {
            console.log(
              'There was an error fetching your accounts. Make sure your Ethereum client is configured correctly.'
            );
          }

    }

    // Generate a message for signing
    // The nonce is generated on the server side 
    function createEthereumMessage() {
        const payload = new SIWPayload();
        payload.domain = domain;
        payload.address = publicKey;
        payload.uri = origin;
        payload.statement = statement;
        payload.version = "1";
        payload.chainId = 1;
        const header = {
          t : "eip191"
        };
        const network = "ethereum"
        let message = new SIWWeb3({ header, payload ,network});
        setSiwwMessage(message);
        const messageText = message.prepareMessage();
        const web3 = new Web3(currentProvider);
        
        web3.eth.personal.sign(messageText, publicKey, "", (err, result) => {
            if (err) {
                console.log(err);
            } else {
                setSignature(result);
            }
        });
    }

    return (
        <>
            {publicKey!="" &&
                sign == "" &&
                <span>
                    <p className={styles.center}>Sign Transaction</p>
                    <input className={styles.publicKey} type="text" id="publicKey" value={publicKey} />
                    <button className={styles.web3auth} id='w3aBtn' onClick={createEthereumMessage} > Sign In With Ethereum</button>
                </span>
            }
            {
                publicKey == "" &&
                sign=="" &&
                <div>
                    <div className={styles.wrapper}>
                        <img className={styles.ethereumlogo} src={EthereumLogo} />
                    </div>
                    <p className={styles.sign}>Sign in With Ethereum</p>
                    <button className={styles.web3auth} id='w3aBtn' onClick={connectWallet} >Connect Wallet</button>
                </div>
            }

            {
                sign &&
                <>
                    <p className={styles.center}>Verify Signature</p>
                    <input className={styles.signature} type="text" id="signature" value={sign} onChange={ e=> setSignature(e.target.value)} />
                    <button className={styles.web3auth} id='verify' onClick={e => {
                        const signature = {
                            t: "eip191",
                            s: sign
                        }
                        const payload = siwwMessage!.payload;
                        siwwMessage!.verify(payload, signature).then((resp: any) => {
                            if (resp.success == true) {
                                Swal.fire("Success","Signature Verified","success")
                            } else {
                                Swal.fire("Error",resp.error!.type,"error")
                            }
                        });
                    }}>Verify</button>
                    <button className={styles.web3auth} id='verify' onClick={e => {
                        setSiwwMessage(null);
                        setSignature("")
                    }}>Back to Wallet</button>
                </>
            }

        </>
    );
};

export default Ethereum;
