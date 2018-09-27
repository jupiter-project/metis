import Methods from '../../config/_methods';

const passphraseLength = 12;
const keywordLength = 4;

describe('Methods', () => {
  describe('generate_passphrase', () => {
    it(`it should generate a ${passphraseLength} word passphrase when called`, () => {
      let passphrase;
      let passphraseBreakdown;

      passphrase = Methods.generate_passphrase();
      passphraseBreakdown = passphrase.split(' ');
      expect(passphraseBreakdown.length).toBe(passphraseLength);

      passphrase = Methods.generate_passphrase();
      passphraseBreakdown = passphrase.split(' ');
      expect(passphraseBreakdown.length).toBe(passphraseLength);
    });
  });
  describe('generate_keywords', () => {
    it(`it should generate a ${keywordLength} word passphrase when called`, () => {
      let keywords;
      let keywordsBreakdown;

      keywords = Methods.generate_keywords();
      keywordsBreakdown = keywords.split(' ');
      expect(keywordsBreakdown.length).toBe(keywordLength);

      keywords = Methods.generate_keywords();
      keywordsBreakdown = keywords.split(' ');
      expect(keywordsBreakdown.length).toBe(keywordLength);
    });
  });
});
