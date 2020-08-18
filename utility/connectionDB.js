var {conData} = require('../models/connectionSchema');

/**
 * getConnection is the function which run when a user click on a particular connection,
 * then that connection's ID used to render the details of connection on connection page.
 */
getConnection = function(connectionId) {
  return new Promise((resolve, reject) => {
      conData.find({ connectionId: connectionId })
      .then(data => {
        resolve(data[0]);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * getConnections function is used to fetch all connections from the database.
 */
getConnections = function() {
    return new Promise((resolve, reject) => {
        conData.find({})
        .then(items => {
            resolve(items);
        })
        .catch(err => {
            return reject(err);
        });
    });
};

/**
 * this function is used to fetch connection category.
 */
getConnectionCategories = async () => {
    let categoryList = await getConnections();
    let categories = [];
    categoryList.forEach(data => {
      if (!categories.includes(data.connectionCategory)) {
        categories.push(data.connectionCategory);
      }
    });
    return categories;
};

module.exports = {getConnections, getConnection, getConnectionCategories};
