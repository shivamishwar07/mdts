export const generateTwoLetterAcronym = (
  statement: string,
  existingAcronyms: string[]
) => {
  const words = statement.split(/\s+/);

  // Generate initial acronym (first letters of the first two words, if available)
  let acronym = "";
  if (words.length >= 2) {
    acronym = (words[0]?.charAt(0) + words[1]?.charAt(0)).toUpperCase();
  } else if (words.length === 1) {
    acronym = words[0]?.slice(0, 2).toUpperCase(); // Take the first two letters of the single word
  }

  // Check if the initial acronym is unique
  if (!existingAcronyms.includes(acronym)) {
    return acronym;
  }

  // Conflict resolution: Generate a unique 2-letter acronym
  let attempts = 0; // Limit attempts to avoid infinite loops
  const maxAttempts = 100;

  while (existingAcronyms.includes(acronym) && attempts < maxAttempts) {
    // Randomly pick two letters from any words
    const randomLetters = words
      .map((word) => {
        if (word.length > 0) {
          return word
            .charAt(Math.floor(Math.random() * word.length))
            .toUpperCase();
        }
        return "";
      })
      .filter((letter) => letter); // Filter out empty entries

    // Select exactly 2 random letters
    acronym = randomLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .join("");

    // Ensure it is exactly 2 characters
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
