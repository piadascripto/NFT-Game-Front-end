const CONTRACT_ADDRESS = "0xFd3bDD92b870D0859871E9f5bcF2382C32a74B43";

/*
 * Adicione esse método e tenha certeza de exportá-lo no final!
 */
const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData };