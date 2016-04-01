/**
 * convert date string to timestamp (with 0.001 seconds precision)
 * @param str
 * @returns {number}
 */
export const timestamp = str=> {
  return +(new Date(str)) / 1000;
}

/**
 * trim a string to its first 8 characters
 * 
 * @param str
 * @returns {string}
 */
export const shorten = (str = "")=> {
  return str.slice(0, 8);
}