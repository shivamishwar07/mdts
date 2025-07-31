export const generateTwoLetterAcronym = (
  statement: string,
  existingAcronyms: string[]
) => {
  const words = statement.split(/\s+/);

  let acronym = "";
  if (words.length >= 2) {
    acronym = (words[0]?.charAt(0) + words[1]?.charAt(0)).toUpperCase();
  } else if (words.length === 1) {
    acronym = words[0]?.slice(0, 2).toUpperCase();
  }

  if (!existingAcronyms.includes(acronym)) {
    return acronym;
  }

  let attempts = 0;
  const maxAttempts = 100;

  while (existingAcronyms.includes(acronym) && attempts < maxAttempts) {
    const randomLetters = words
      .map((word) => {
        if (word.length > 0) {
          return word
            .charAt(Math.floor(Math.random() * word.length))
            .toUpperCase();
        }
        return "";
      })
      .filter((letter) => letter);

    acronym = randomLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .join("");

    if (acronym.length < 2 && randomLetters.length > 2) {
      acronym += randomLetters[2].charAt(0);
    }

    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new Error("Unable to generate a unique 2-character acronym.");
  }

  return acronym;
};

// Example usage
// const statement = "Artificial Intelligence and Machine Learning";
// const existingAcronyms = ["AI", "ML", "AM", "IM"];

// const newAcronym = generateTwoLetterAcronym(statement, existingAcronyms);
// console.log("Generated Acronym:", newAcronym);
