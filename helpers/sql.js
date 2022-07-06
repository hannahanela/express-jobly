const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate: creates object of table columns and the values to be
 *  updated.
 * 
 * Inputs:
 *  dataToUpdate: an object of column names as keys and values to update.
 *    {firstName: 'Aliya', age: 32}
 * 
 *  jsToSql: JS camelCase key name with values of SQL snake_case key name.
 *    {firstName: first_name }
 * 
 * Returns:
 *  { setCols: '"first_name"=$1"age"=$2', values: ['Aliya', '32'] }
 * 
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
