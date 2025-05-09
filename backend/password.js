// const bcrypt = require('bcrypt');
import bcrypt from "bcrypt";

// Number of salt rounds for bcrypt
const saltRounds = 10;

// Function to encode/hash a password
async function encodePassword(plainTextPassword) {
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error encoding password:", error.message);
    throw error;
  }
}

// Function to verify a password against a stored hash
function verifyPassword(plainTextPassword, storedHashedPassword) {
  try {
    // Compare the provided password with the stored hash
    const isMatch = bcrypt.compare(plainTextPassword, storedHashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error.message);
    throw error;
  }
}

export { encodePassword, verifyPassword };

// Example usage
// async function main() {
//   // Registration example
//   const userPassword = 'SecurePassword123!';

//   try {
//     // When a user registers, encode their password
//     const hashedPassword = await encodePassword(userPassword);
//     console.log('Stored hashed password:', hashedPassword);

//     // Simulate database storage
//     const userInDatabase = {
//       username: 'user123',
//       passwordHash: hashedPassword
//     };

//     // Login example - correct password
//     const loginAttempt1 = 'SecurePassword123!';
//     const isPasswordCorrect1 = await verifyPassword(loginAttempt1, userInDatabase.passwordHash);
//     console.log('Login attempt 1 successful:', isPasswordCorrect1); // Should be true

//     // Login example - incorrect password
//     const loginAttempt2 = 'WrongPassword123';
//     const isPasswordCorrect2 = await verifyPassword(loginAttempt2, userInDatabase.passwordHash);
//     console.log('Login attempt 2 successful:', isPasswordCorrect2); // Should be false
//   } catch (error) {
//     console.error('Error in password operations:', error);
//   }
// }
