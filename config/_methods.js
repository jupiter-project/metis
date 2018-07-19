const WordList = require('./_word_list');

module.exports = {
  generate_passphrase: () => {
    // The following is the code which will generate a list of 12 random words that will be
    // used to generate an nxt account
    const { words } = WordList;
    const seedArray = [];
    const seedphraseList = [];

    for (let x = 0; x < 12; x += 1) {
      seedArray.push(words);
    }

    seedArray.forEach((seedList) => {
      const word = seedList[Math.floor(Math.random() * seedList.length)];

      seedphraseList.push(word);
    });

    const seedphrase = seedphraseList.join(' ');

    return seedphrase;
  },
  generate_keywords: () => {
    // The following is the code which will generate a list of 4 random words
    // that will be used to generate an api key
    const { words } = WordList;
    const seedArray = [];
    const seedphraseList = [];

    for (let x = 0; x < 4; x += 1) {
      seedArray.push(words);
    }

    seedArray.forEach((seedList) => {
      const word = seedList[Math.floor(Math.random() * seedList.length)];
      seedphraseList.push(word);
    });

    const seedphrase = seedphraseList.join(' ');

    return seedphrase;
  },
};
