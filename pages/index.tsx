import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ethers } from 'ethers'
import 'react-toastify/dist/ReactToastify.css'
import Head from 'next/head'
import abi from '../utils/CoffeePortal.json'

declare var window: any
toast.configure()

export default function Home() {
  /**
   * Contract Holder
   */
  const contractAddress = '0x4Ef5E1A0443C99A3E4856b51d95d52508f3738CE'

  /**
   * Contract ABI from Json
   */
  const contractABI = abi.abi

  const [currentAccount, setCurrentAccount] = useState('')

  const [message, setMessage] = useState('')

  const [name, setName] = useState('')

  /**
   * State to store Coffee
   */
  const [allCoffee, setAllCoffee] = useState([])

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]

        setCurrentAccount(account)
        toast.success(`Wallet is connected ${account} `, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      } else {
        toast.warn('Make sure metamask wallet is connected', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    } catch (err) {
      console.log(err.message)
      toast.error(`${err.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        toast.warn('Make sure metamask wallet is connected', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setCurrentAccount(accounts[0])
    } catch (err) {
      console.error('Error: ', err)
    }
  }

  /**
   * Method used to request buyACoffee to the smart contract
   */
  const buyACoffee = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const coffeeContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await coffeeContract.getTotalCoffee()
        console.log(`A total of ${count.toNumber()} coffees retrieved..`)

        const coffeeTxn = await coffeeContract.buyCoffee(
          message ? message : 'Enjoy this good coffee',
          name ? name : 'Anonymous',
          ethers.utils.parseEther('0.001'),
          {
            value: ethers.utils.parseEther('0.001'),
            //gasLimit: 300000,
          }
        )
        console.log(`Mining Coffee...${coffeeTxn.hash}`)

        toast.info('Sending Tip for Coffee...', {
          position: 'top-left',
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })

        await coffeeTxn.wait()

        console.log('Coffee Mined')

        count = await coffeeContract.getTotalCoffee()

        console.log('Retrieved total coffee count...', count.toNumber())

        setMessage('')
        setName('')

        //Toast Success
        toast.success('Coffee Purchased successfully!', {
          position: 'top-left',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err.message)
      toast.error(`${err.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }
  /*
   * Create a method that gets all coffee from your contract
   */
  const getAllCoffee = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const coffeeContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        /*
         * Call the getAllCoffee method from your Smart Contract
         */
        const coffees = await coffeeContract.getAllCoffee()

        /*
         * We only need address, timestamp, name, and message in our UI so let's
         * pick those out
         */
        const coffeeCleaned = coffees.map((coffee: any) => {
          return {
            address: coffee.giver,
            timestamp: new Date(coffee.timestamp * 1000),
            message: coffee.message,
            name: coffee.name,
          }
        })

        /*
         * Store our data in React State
         */
        setAllCoffee(coffeeCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {

    let coffeeContract: any;
    getAllCoffee();
    checkIfWalletIsConnected();

    const onNewCoffee = (from:any, timestamp:any, message:any, name:any) => {
      console.log("NewCoffee", from, timestamp, message, name);
      
      setAllCoffee((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          name: name,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      coffeeContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      coffeeContract.on("NewCoffee", onNewCoffee);
    }

    return () => {
      if (coffeeContract) {
        coffeeContract.off("NewCoffee", onNewCoffee);
      }
    };
  }, []);

  const handleOnMessageChange = (event:any) => {
    const { value } = event.target;
    setMessage(value);
  };
  const handleOnNameChange = (event:any) => {
    const { value } = event.target;
    setName(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Buy Me a Coffee using Ether</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-400 mb-6">
          Buy Me A Coffee
        </h1>
        {/*
         * If there is currentAccount render this form, else render a button to connect wallet
         */}

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  onChange={handleOnNameChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Send the Creator a Message
                </label>

                <textarea
                  className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Message"
                  id="message"
                  onChange={handleOnMessageChange}
                  required
                ></textarea>
              </div>

              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-400 hover:bg-blue-400 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={buyACoffee}
                >
                  Support $5
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            className="bg-blue-400 hover:bg-blue-400 text-white font-bold py-2 px-3 rounded-full mt-3"
            onClick={connectWallet}
          >
            Connect Your Wallet
          </button>
        )}

        {allCoffee.map((coffee, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-400 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-amber-200 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-200 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Supporter: {coffee.name}</h1>
                  <h1 className="text-md">Message: {coffee.message}</h1>
                  <h3>Address: {coffee.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {coffee.timestamp.toString()}
                  </h1>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}