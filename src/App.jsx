/*
 * Nós vamos precisar usar estados agora! Não esqueça de importar useState
 */
import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import MyEpicGame from "./MyEpicGame.json";
import twitterLogo from "./assets/twitter-logo.svg";
import SelectCharacter from './Components/SelectCharacter/index.jsx';
import Arena from './Components/Arena/index.jsx';
import { CONTRACT_ADDRESS, transformCharacterData } from './Components/constants.jsx';
import LoadingIndicator from "./Components/LoadingIndicator/index.jsx";

// Constantes
const TWITTER_HANDLE = "piadascripto";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const App = () => {
  // Estado
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const renderContent = () => {

    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Conecte sua carteira para jogar
          </button>
        </div>
      );
      /*
       * cenário #2
       */
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;

    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Parece que você não tem a metamask instalada!");

        setIsLoading(false);
        return;
      } else {
        console.log("Objeto ethereum encontrado:", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Carteira conectada:", account);
          setCurrentAccount(account);
        } else {
          console.log("Não foi encontrada uma carteira conectada");
        }
      }
    } catch (error) {
      console.log(error);
    }
    /*
     * Nós lançamos a propriedade de estado depois de toda lógica da função
     */
    setIsLoading(false);
  };
  /*
   * Implementa o seu método connectWallet aqui
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Instale a MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      /*
       * Boom! Isso deve escrever o endereço público uma vez que autorizarmos Metamask.
       */
      console.log("Contectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  // UseEffects
  useEffect(() => {
    /*
     * Quando nosso componente for montado, tenha certeza de configurar o estado de carregamento
     */
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);
  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log(
        "Verificando pelo personagem NFT no endereço:",
        currentAccount
      );
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      const characterNFT = await gameContract.checkIfUserHasNFT();
      if (characterNFT.name) {
        console.log("Usuário tem um personagem NFT");
        setCharacterNFT(transformCharacterData(characterNFT));
      } else {
        console.log("Nenhum personagem NFT foi encontrado");
      }
      /*
       * Uma vez que tivermos acabado a busca, configure o estado de carregamento para falso.
       */
      setIsLoading(false);
    };
    if (currentAccount) {
      console.log("Conta Atual:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Copa do mundo no Metaverso </p>
          <p className="sub-text">Junte os amigos e vença a taça!</p>
             {renderContent()}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
      </div>
    </div>
  );
};

export default App;