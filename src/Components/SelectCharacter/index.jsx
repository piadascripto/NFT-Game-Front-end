import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants.jsx";
import MyEpicGame from "../../MyEpicGame.json";
import LoadingIndicator from "../LoadingIndicator/index.jsx";


const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const [mintingCharacter, setMintingCharacter] = useState(false);

  // Métodos de renderização
const renderCharacters = () =>
  characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={character.imageURI} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)} 

        // você deve descomentar essa linha depois que criar a função mintCharacterNFTAction
      >{`Mintar ${character.name}`}</button>
    </div>
  ));

  // UseEffect
useEffect(() => {
  const { ethereum } = window;

  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyEpicGame.abi,
      signer
    );

    setGameContract(gameContract);
  } else {
    console.log("Objeto Ethereum não encontrado");
  }
}, [ethereum]);

useEffect(() => {
  const getCharacters = async () => {
    try {
      console.log("Trazendo personagens do contrato para mintar");

      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log("charactersTxn:", charactersTxn);

      const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData)
      );

      setCharacters(characters);
    } catch (error) {
      console.error("Algo deu errado ao trazer personagens:", error);
    }
  };

  /*
   * Adiciona um método callback que vai disparar quando o evento for recebido
   */
  const onCharacterMint = async (sender, tokenId, characterIndex) => {
    console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
    );

    /*
     * Uma vez que nosso personagem for mintado, podemos buscar os metadados a partir do nosso contrato e configurar no estado para se mover para a Arena.
     */
    if (gameContract) {
      const characterNFT = await gameContract.checkIfUserHasNFT();
      console.log("CharacterNFT: ", characterNFT);
      setCharacterNFT(transformCharacterData(characterNFT));
    }
  };

  if (gameContract) {
    getCharacters();

    /*
     * Configurar NFT Minted Listener
     */
    gameContract.on("CharacterNFTMinted", onCharacterMint);
  }

  return () => {
    /*
     * Quando seu componente se desmonta, vamos limpar esse listener
     */
    if (gameContract) {
      gameContract.off("CharacterNFTMinted", onCharacterMint);
    }
  };
}, [gameContract]);

const mintCharacterNFTAction = (characterId) => async () => {
  try {
    if (gameContract) {
      /*
       * Mostre nosso indicador de carregamento
       */
      setMintingCharacter(true);
      console.log("Mintando personagem...");
      const mintTxn = await gameContract.mintCharacterNFT(characterId);
      await mintTxn.wait();
      console.log(mintTxn);
      /*
       * Esconde nosso indicador de carregamento quando o mint for terminado
       */
      setMintingCharacter(false);
    }
  } catch (error) {
    console.warn("Ação de mintar com erro: ", error);
    /*
     * Se tiver um problema, esconda o indicador de carregamento também
     */
    setMintingCharacter(false);
  }
};


return (
  <div className="select-character-container">
    <h2>Minte seu jogador épico. Escolha com sabedoria</h2>
    {characters.length > 0 && (
      <div className="character-grid">{renderCharacters()}</div>
    )}
    {/* Só mostre o seu indicador de carregamento se mintingCharacter for verdadeiro */}
    {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Mintando personagem...</p>
        </div>
        <img
          src="http://pa1.narvii.com/6623/1d810c548fc9695d096d54372b625d207373130a_00.gif"
          alt="Indicador de Mintagem"
        />
      </div>
    )}
  </div>
);

  

  
};

export default SelectCharacter;