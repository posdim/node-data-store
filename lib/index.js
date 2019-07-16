/* eslint-disable security/detect-object-injection */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
const {
  isObject, isString, isNull, isUndefined
} = require('@posdim/types');

const _weakMap = new WeakMap();

/**
 * DataStore
 * @class
 * @param {object} obj to be stored
 */
function DataStore(obj) {
  const data = Object.assign({}, (isObject(obj) ? obj : {}), _weakMap.get(this));
  _weakMap.set(this, data);
}

/**
 * Get all data from weakmap
 * @returns {object} object value
 */
DataStore.prototype.all = function all() {
  return _weakMap.get(this);
};

/**
 * Get value by key
 * @param {string} key to be get
 * @returns {any} any value
 */
DataStore.prototype.get = function get(key) {
  let data = _weakMap.get(this);
  if (!isObject(data) || !isString(key)) { return; }
  const pathArr = key.split('.');

  for (let i = 0; i < pathArr.length; i++) {
    if (!Object.prototype.propertyIsEnumerable.call(data, pathArr[i])) {
      return;
    }
    data = data[pathArr[i]];
    if (isUndefined(data) || isNull(data)) {
      if (i !== pathArr.length - 1) {
        return;
      }
      break;
    }
  }
  return data;
};

/**
 * Check whether key in data
 * @param {string} key to be checked
 * @returns {boolean} true/false
 */
DataStore.prototype.has = function has(key) {
  let data = _weakMap.get(this);
  if (!isObject(data) || !isString(key)) {
    return false;
  }
  const pathArr = key.split('.');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < pathArr.length; i++) {
    if (isObject(data)) {
      if (!(pathArr[i] in data)) {
        return false;
      }
      data = data[pathArr[i]];
    } else {
      return false;
    }
  }
  return true;
};

/**
 * Set new key to data
 * @param {string} key to be key
 * @param {any} val to be value
 * @returns {object} object value
 */
DataStore.prototype.set = function set(key, val) {
  let data = _weakMap.get(this);
  if (!isObject(data) || !isString(key)) { return; }

  if (val instanceof Error) {
    let newVal = {};
    Object.getOwnPropertyNames(val).forEach((key2) => {
      if (key2 === 'stack') {
        val[key2] = val[key2].replace(/ {4}/g, '').split('\n');
      }
      newVal = Object.assign(newVal, { [key2]: val[key2] });
    });
    val = newVal;
  }

  const pathArr = key.split('.');
  for (let i = 0; i < pathArr.length; i++) {
    const path = pathArr[i];
    if (!isObject((data[path]))) {
      data[path] = {};
    }
    if (i === pathArr.length - 1) {
      data[path] = val;
    }
    data = data[path];
  }
  return this.all();
};

/**
 * Remove key on data
 * @param {string} key to be removed
 * @returns {void} void
 */
DataStore.prototype.remove = function remove(key) {
  let data = _weakMap.get(this);
  if (!isObject(data) || !isString(key)) { return; }

  const pathArr = key.split('.');
  for (let i = 0; i < pathArr.length; i++) {
    const path = pathArr[i];
    if (i === pathArr.length - 1) {
      delete data[path];
      return;
    }
    data = data[path];
    if (!isObject(data)) {
      return;
    }
  }
};

module.exports = DataStore;
