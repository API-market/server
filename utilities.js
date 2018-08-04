const removeEmptyObj = (obj) => {
  if (obj) {
    Object.keys(obj.dataValues).forEach((key) => (obj.dataValues[key] == null) && delete obj.dataValues[key]);
  }
  return obj;
};
const removeEmpty = (obj) => {

  if (Array.isArray(obj)) {
    obj.forEach(element => {
      element = removeEmptyObj(element);
    })
  } else {
    return removeEmptyObj(obj);
  }
  return obj;
};

module.exports = {
  removeEmptyObj: removeEmptyObj,
  removeEmpty: removeEmpty
};
