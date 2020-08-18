var userProfileData = require('../models/userProfileSchema');

/**
 * This function is used to fetch all the profile documents of user considering its email address as unique key.
 */
getUserProfile= function(uEmail) {
  return new Promise((resolve, reject) => {
      userProfileData.find({ uEmail: uEmail })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

module.exports = getUserProfile;
