import WordList from './_word_list';

module.exports = {
  generate_passphrase: () => {
    // The following is the code which will generate a list of 12 random words that will be
    // used to generate an nxt account
    const word_list = WordList.words;
    const seed_array = [];
    const seedphrase_list = [];

    for (let x = 0; x < 12; x += 1) {
      seed_array.push(word_list);
    }

    seed_array.forEach((seed_list) => {
      const word = seed_list[Math.floor(Math.random() * seed_list.length)];

      seedphrase_list.push(word);
    });

    const seedphrase = seedphrase_list.join(' ');

    return seedphrase;
  },
  generate_keywords: () => {
    // The following is the code which will generate a list of 4 random words
    // that will be used to generate an api key
    const word_list = WordList.words;
    const seed_array = [];
    const seedphrase_list = [];

    for (let x = 0; x < 4; x += 1) {
      seed_array.push(word_list);
    }

    seed_array.forEach((seed_list) => {
      const word = seed_list[Math.floor(Math.random() * seed_list.length)];
      seedphrase_list.push(word);
    });

    const seedphrase = seedphrase_list.join(' ');

    return seedphrase;
  },
};
