const { BadRequestError } = require("../expressError");

// TODO: Inputs: group text and examples for visual clarity.
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
 *  { setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] }
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

/** sqlForFilter: creates object of table columns and the values to be
 *  updated.
 *
 * Inputs:
 *  dataToFilter: an object of column names as keys and values to update.
 *    {minEmployees: 2, maxEmployees: 4, nameLike: 'Aliya'}
 *
 *  If no inputs for dataToFilter, returns null to indicate no WHERE Clause
 *    needed.
 *
 *  jsToSql: JS camelCase key name with values of SQL snake_case key name.
 *    {minEmployees:'num_employees',
 *       maxEmployees: 'num_employees',
 *       nameLike: 'name' }
 *
 * Returns:
 *  { whereClause: 'WHERE "num_employees">= $1
 *                    AND "num_employees"<= $2'
 *                    AND "name" ILIKE $3',
 *    values: [2, 4, "%Aliya%]}
 *
 */
// TODO: jsToSql param unnecessary. Can just supply specific SQL col name needed.
// swap lines 70&71 --> push first and then use length to determine $ value,
// rather than using idx
// _sqlForFilter under Company --> only used for filtering Companies
function sqlForFilter(dataToFilter, jsToSql) {
  console.log("in sqlForFilter");

  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) return null;

  const cols = [];
  const filterVals = [];
  let idx = 1;

  if (dataToFilter.minEmployees) {
    const colName = "minEmployees";
    cols.push(`"${jsToSql[colName] || colName}">=$${idx}`);
    filterVals.push(dataToFilter.minEmployees);
    idx++;
  }

  if (dataToFilter.maxEmployees) {
    const colName = "maxEmployees";
    cols.push(`"${jsToSql[colName] || colName}"<=$${idx}`);
    filterVals.push(dataToFilter.maxEmployees);
    idx++;
  }

  if (dataToFilter.nameLike) {
    const colName = "nameLike";
    dataToFilter.nameLike = `%${dataToFilter.nameLike}%`;
    cols.push(`"${jsToSql[colName] || colName}" ILIKE $${idx}`);
    filterVals.push(dataToFilter.nameLike);
    idx++;
  }

  return {
    whereClause: `WHERE ${cols.join(" AND ")}`,
    values: filterVals,
  };
}


module.exports = { sqlForPartialUpdate, sqlForFilter };
