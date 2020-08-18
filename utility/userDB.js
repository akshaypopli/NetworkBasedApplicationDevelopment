var userData = require('../models/userSchema');

/**
 * This function is created to validate the user, when we have multiple users.
 * Though I have only one user on database now, so this function is not in use.
 * Initially I have implemented my application with multiple users but according to 
 * specification in milestone 4 directions, it is not mandatory to have multiple users,
 * so I have removed that part.
 */
getUser= function(uEmail) {
  return new Promise((resolve, reject) => {
      userData.find({ email: uEmail })
      .then(data => {
        resolve(data[0]);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

module.exports = getUser;
