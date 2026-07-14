const User = require("../models/User");

/**
 * Generates a unique 4-digit student code.
 * Keeps generating random codes until one is found that
 * doesn't already exist in the database.
 */
const generateStudentCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    code = `EDU-${randomNumber}`;

    const existingUser = await User.findOne({ studentCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
};

module.exports = generateStudentCode;