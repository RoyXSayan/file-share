// testBcrypt.js
import bcrypt from "bcrypt";

const plain = "sayan";

// Step 1: Generate a hash for testing
bcrypt.hash(plain, 10, (err, hash) => {
  if (err) throw err;

  console.log("Generated hash:", hash);

  // Step 2: Compare with the plain text
  bcrypt.compare(plain, hash, (err, result) => {
    console.log("Match result:", result); // should be true
  });
});
