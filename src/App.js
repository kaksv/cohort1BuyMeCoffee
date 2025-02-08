import abi from "./utils/BuyMeACoffee.json";
import {ethers} from "ethers";
import React, {memo, useEffect, useState} from "react";

function App() {
  const contractAddress = "0x09Bcca8E9fCD2133fAf1C76e38415EF424f55AA4";
  const contractAbi = abi.abi;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  //Check Wallet Connection
  const isWalletConnected = async () => {
    try {
      const {ethereum} = window;
      if(ethereum) {
        const accounts =await ethereum.request({method: "eth_accounts"});
        if(accounts >0 ) {
          const account = accounts[0];
          alert(`Connected to ${account}`);
          console.log(`Connected to ${account}`);
        }else {
          alert("Ensure Metamask is connected");
        }
      }else {
        alert("Install Metamask");
      }
    }catch(error) {
      console.log(error);
    }
  }

  //Connect the Wallet
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if(!ethereum) {
        alert("Install Metamask");
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      setCurrentAccount(accounts[0]);
    }catch(error) {
      console.log(error);
    }
  }

  //Fetch All the tips received on chain
  const getMemos = async () => {
    try {
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const BuyMeACoffee = new ethers.Contract(contractAddress, contractAbi, signer);
        const memos =  await BuyMeACoffee.getMemos();
        setMemos(memos);
      }
    }catch(error) {
      console.log("Wallet not installed");
    }
  }

  useEffect(() => {
    let buyMeCoffee;
    isWalletConnected();
    getMemos();

    //create a function to show the memo/message of anyone that buys or tips us.
    const onNewMemo = (from, timestamp, name, message) =>{
      console.log("Memo Received:", from,timestamp,name,message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
          from,
        },
      ]);
    };

    const {ethereum} = window;
    if(ethereum ) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const buyMeACoffee = new ethers.Contract(contractAddress, contractAbi, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if(buyMeCoffee) {
        buyMeCoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);


  const buyCoffee = async () => {
    try {
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const BuyMeACoffee = new ethers.Contract(contractAddress, contractAbi, signer);
        const coffeeTxn = await BuyMeACoffee.buyCoffees(name ? name : "anon", message ? message : "Enjoy your coffee!",{
          value: ethers.utils.parseEther("0.001")
        });
        await coffeeTxn.wait();
        console.log("Done", coffeeTxn.hash);
        alert("Thank you for the coffee purchase");
        //Clear form fields
        setName("");
        setMessage("");
      }
    }catch(error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <title>Tipping is awesome. Buy Me Coffee</title>
     <main className="main">

      {currentAccount ? (
      <div>
        <form>
          <div>
          <label>
            Name:
            <br/>
            <input type="text" name="name" placeholder="anon" onChange={onNameChange} />
          </label>
          </div>
          <br />
          <div>
          <label> Send a Tip Message </label>
          <br />
          <textarea rows={4} placeholder="Enjoy and get some time to relax" onChange={onMessageChange} required></textarea>
          </div>
          <div>
            <button type= "button" onClick={buyCoffee}>Buy Coffee at 0.001 ETH</button>
          </div>
        </form>
      </div>
      ) : (
        <button onClick={connectWallet}>Connect Your Wallet</button>
      )}
     </main>
     {currentAccount && (<h1>Tips received</h1>)}

     {currentAccount && memos.map((memos, idx) => {
      return (
        <div key={idx} styles={{border: "2px solid", borderRadius: "5px",padding: "5px" }}>
          <p styles={{fontWeight: "bold"}}>{memos.message}</p>
          <p>From: {memo.name} at {memo.timestamp.toString()}
            <br/>
            Wallet Address: {memo.from}
          </p>
        </div>
      )
     })}
     
    </div>
  );
}

export default App;
