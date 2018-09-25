import WordList from '../../config/_word_list';

const wordCount = 1624;

describe('WordList', () => {
  it("it should return an object with 'words' as one of its params", () => {
    expect(typeof WordList).toBe('object');
  });
  describe('words', () => {
    it(`it should return an array of ${wordCount} words`, () => {
      expect(typeof WordList.words).toBe('object');
      expect(WordList.words.length).toBe(wordCount);
    });
  });
});
