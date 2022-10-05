import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

// Identify website elements and assign events
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getBalanceButton = document.getElementById("getBalanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
getBalanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers) //show the content of the ethers object

// Connect Wallet Function
async function connect() {
  // Check if ethereum wallet plugin is available
  if (typeof window.ethereum != undefined) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      connectButton.innerHTML = "Connected!"
      console.log("Connected.")
    } catch (error) {
      console.log(error)
    }
  } else {
    connectButton.innerHTML = "No wallet plugin found."
    console.log("Please install Metamask.")
  }
}

// Fund Function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount} ETH...`)
  if (typeof window.ethereum != undefined) {
    // get provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // get signer / wallet / private key / someone with some gas
    const signer = provider.getSigner()
    // get contract
    const contract = new ethers.Contract(contractAddress, abi, signer)

    // execute fund() function
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // listen for transactionReceipt
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}

async function getBalance() {
  //console.log("Hello")
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  } else {
    console.log("Wallet is not connected.")
  }
}

async function withdraw() {
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    // execute fund() function
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      console.log(`Withdrawal successful.`)
      getBalance()
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise((resolve, reject) => {
    try {
      // Event listener --> triggers anonymous function with input transactionReceipt, once transactionResponse.hash is received --> then returns 'resolve'
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        )
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}
