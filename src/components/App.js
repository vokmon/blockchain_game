import React, { useRef, useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import MemoryToken from '../abis/MemoryToken.json';
import brain from '../brain.png';

const CARD_ARRAY = [
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  }
];

const initWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    window.alert(
      'Non-Ethereum browser detected. You should consider trying MetaMask!'
    );
  }
};

const App = () => {
  const [account, setAccount] = useState('0x0');
  const [data, setData] = useState({
    totalSupply: 0,
    tokenURIs: [],
  });

  const [cardsArray] = useState(() => (CARD_ARRAY.sort(() => 0.5 - Math.random())));
  const [cardsWon, setCardsWon] = useState([]);
  const [cardsChosenId, setCardsChosenId] = useState([]);
  const [cardsChosen, setCardsChosen] = useState([]);

  const tokenRef = useRef(null);

  const loadAccount = async () => {
    const { web3 } = window;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
  }

  const loadContract = async () => {
    const { web3 } = window;
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const networkData = MemoryToken.networks[networkId];
    if (networkData) {
      const { abi } = MemoryToken;
      const { address } = networkData;
      console.log(address)
      tokenRef.current = new web3.eth.Contract(abi, address);
    } else {
      alert('Smart contract not deployed to the detected network.')
    }
  };

  const loadData = async() => {
    const totalSupply = await tokenRef.current.methods.totalSupply().call();
    console.log(totalSupply)

    let balanceOf = await tokenRef.current.methods.balanceOf(account).call();
    const tokenURIs = [];
    for (let i=0; i< balanceOf; i++) {
      let id = await tokenRef.current.methods.tokenOfOwnerByIndex(account, i).call();
      let tokenURI = await tokenRef.current.methods.tokenURI(id).call();
      tokenURIs.push(tokenURI);
    }
    setData({
      ...data,
      totalSupply,
      tokenURIs,
    })
  }

  useEffect(() => {
    const init = async () => {
      await initWeb3();
      await loadAccount();
      await loadContract();
    };
    init();
  }, []);

  useEffect(() => {
    if (account && tokenRef.current) {
      loadData();
    }
  }, [account, tokenRef.current]);

  const checkForMatch = async (nCardsChosenId, nCardsChosen) => {
    const optionOneId = nCardsChosenId[0]
    const optionTwoId = nCardsChosenId[1]

    let newCardsWon = cardsWon;

    if(optionOneId === optionTwoId) {
      alert('You have clicked the same image!')
    } else if (nCardsChosen[0] === nCardsChosen[1]) {
      alert('You found a match')

      const receipt = await tokenRef.current.methods
      .mint(account, `${window.location.origin}${CARD_ARRAY[optionOneId].img.toString()}`)
      .send({ from: account });

      console.log(receipt);
      newCardsWon = [
        ...cardsWon,
        optionOneId,
        optionTwoId,
      ];
      setData({
        ...data,
        tokenURIs: [
          ...data.tokenURIs,
          CARD_ARRAY[optionOneId].img,
        ]
      })
      setCardsWon(newCardsWon)
    } else {
      alert('Sorry, try again')
    }
    setCardsChosenId([]);
    setCardsChosen([]);

    if (newCardsWon.length === CARD_ARRAY.length) {
      alert('Congratulations! You found them all!')
    }
  }

  const chooseImage = (cardId) => {
    const cardIdStr = cardId.toString()
    if(cardsWon.includes(cardIdStr)) {
      return window.location.origin + '/images/white.png'
    }
    else if(cardsChosenId.includes(cardIdStr)) {
      return CARD_ARRAY[cardIdStr].img
    } else {
      return window.location.origin + '/images/blank.png'
    }
  }

  const flipCard = async (cardId) => {
    let alreadyChosen = cardsChosen.length

    const newCardsChosen = [
      ...cardsChosen,
      cardsArray[cardId].name,
    ];
    setCardsChosen(newCardsChosen);

    const newCardsChosenId = [
      ...cardsChosenId,
      cardId,
    ];
    setCardsChosenId(newCardsChosenId);

    if (alreadyChosen === 1) {
      setTimeout(() => {
        checkForMatch(newCardsChosenId, newCardsChosen);
      }, 100);
      
    }
  }

  return (
    <div>
      <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
        <a
          className='navbar-brand col-sm-3 col-md-2 mr-0'
          href='http://www.dappuniversity.com/bootcamp'
          target='_blank'
          rel='noopener noreferrer'
        >
          <img
            src={brain}
            width='30'
            height='30'
            className='d-inline-block align-top'
            alt=''
          />
          &nbsp; Memory Tokens
        </a>
        <ul className='navbar-nav px-3'>
          <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
            <small className='text-muted'>
              <span id='account'>{account}</span>
            </small>
          </li>
        </ul>
      </nav>
      <div className='container-fluid mt-5'>
        <div className='row'>
          <main role='main' className='col-lg-12 d-flex text-center'>
            <div className='content mr-auto ml-auto'>
              <h1 className='d-4'>Start matching now</h1>

              <div className='grid mb-4'>
                { cardsArray.map((card, key) => {
                    return(
                      <img
                        key={key}
                        alt='card'
                        src={chooseImage(key)}
                        data-id={key}
                        onClick={(event) => {
                          let cardId = event.target.getAttribute('data-id')
                          if(!cardsWon.includes(cardId.toString())) {
                            flipCard(cardId)
                          }
                        }}
                      />
                    )
                  })}
              </div>

              <div>
              <h5>Tokens Collected:<span id="result">&nbsp;{data.tokenURIs.length}</span></h5>

                <div className="grid mb-4" >

                  { data.tokenURIs.map((tokenURI, key) => {
                    return(
                      <img
                        key={key}
                        src={tokenURI}
                        alt='token uri'
                      />
                    )
                  })}

                </div>

                <div className='grid mb-4'>{/* Code goes here... */}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
