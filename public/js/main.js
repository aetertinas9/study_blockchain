let totalAddresses = 0;

//key
const generate_seed = () => {
  const new_seed = lightwallet.keystore.generateRandomSeed();
  document.getElementById("seed").value = new_seed;
  generate_addresses(new_seed);
};

const generate_addresses = (seed) => {
  if(seed == undefined) {
    seed = document.getElementById("seed").value;
  }

  if(!lightwallet.keystore.isSeedValid(seed)) {
    document.getElementById("info").innerHTML = "Please enter a valid seed";
    return;
  }

  totalAddresses = prompt("How many addresses do you want to generate");

  if(!Number.isInteger(parseInt(totalAddresses))) {
    document.getElementById("info").innerHTML = "Please enter valid number of addresses";
    return;
  }

  const password = Math.random().toString();

  lightwallet.keystore.createVault({
    password: password,
    seedPhrase: seed,
    hdPathString: "m/0'/0'/0'",
  }, (err, ks) => {
    ks.keyFromPassword(password, (err, pwDerivedKey) => {
      if(err) {
        document.getElementById("info").innerHTML = err;
      }
      else {
        ks.generateNewAddress(pwDerivedKey, totalAddresses);
        const addresses = ks.getAddresses();
        const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

        let html = "";
        for(let count = 0; count < addresses.length; count++) {
          const address = addresses[count];
          const private_key = ks.exportPrivateKey(address, pwDerivedKey);
          const balance = web3.eth.getBalance("0x" + address);

          html = html + "<li>";
          html = html + "<p><b>Address: </b>0x" + address + "</p>";
          html = html + "<p><b>Private Key: </b>0x" + private_key + "</p>";
          html = html + "<p><b>Balance: </b>" + web3.fromWei(balance, "ether") + " ether</p>";
          html = html + "</li>";
        }
        document.getElementById("list").innerHTML = html;
      }
    });
  });
};


//send wallet
function send_ether() {
  const	seed = document.getElementById("seed").value;

  if(!lightwallet.keystore.isSeedValid(seed)) {
    document.getElementById("info").innerHTML = "Please enter a valid seed";
    return;
  }

  const password = Math.random().toString();

  lightwallet.keystore.createVault({
    password: password,
    seedPhrase: seed
  }, (err, ks) => {
    ks.keyFromPassword(password, (err, pwDerivedKey) => {
      if(err) {
        document.getElementById("info").innerHTML = err;
      }
      else {
        ks.generateNewAddress(pwDerivedKey, totalAddresses);

        ks.passwordProvider = (callback) => {
          callback(null, password);
        };

        const provider = new HookedWeb3Provider({
          host: "http://localhost:8545",
          transaction_signer: ks
        });

        const web3 = new Web3(provider);
        const from = document.getElementById("address1").value;
        const to = document.getElementById("address2").value;
        const value = web3.toWei(document.getElementById("ether").value, "ether");

        web3.eth.sendTransaction({
          from: from,
          to: to,
          value: value,
          gas: 21000,
        }, (error, result) => {
          if(error) {
            document.getElementById("info").innerHTML = error;
          }
          else {
            document.getElementById("info").innerHTML = "Txn hash: " + result;
          }
        })
      }
    });
  });
}
