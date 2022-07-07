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
 *    {minEmployees:
 *      'num_employees',
 *       maxEmployees: 'num_employees',
 *       nameLike: 'name' }
 *
 * Returns:
 *  { whereClause: 'WHERE "num_employees">= $1 AND "num_employees"<= $2' AND "name" ILIKE $3',
 *    values: [2, 4, "%Aliya%]}
 *
 */
 function sqlForFilter(dataToFilter, jsToSql) {
  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) return null;

  const cols = []
  let idx = 1;

  if (dataToFilter.minEmployees) {
    const colName = "minEmployees";
    cols.unshift(`"${jsToSql[colName] || colName}">=$${idx}`);
    idx++;

  }

  if (dataToFilter.maxEmployees) {
    const colName = "maxEmployees";
    cols.unshift(`"${jsToSql[colName] || colName}"<=$${idx}`);
    idx++;

  }

  if (dataToFilter.nameLike) {
    const colName = "nameLike";
    dataToFilter.nameLike = `%${dataToFilter.nameLike}%`;
    cols.push(`"${jsToSql[colName] || colName}" ILIKE $${idx}`);
    idx++;
  }

  console.log("IN SQL FUNCTION", `WHERE ${cols.join(" AND ")}`);

  return {
    whereClause: `WHERE ${cols.join(" AND ")}`,
    values: Object.values(dataToFilter),
  };
}


module.exports = { sqlForPartialUpdate, sqlForFilter };
