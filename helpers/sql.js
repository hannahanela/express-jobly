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

  console.log("cols is", cols);
  
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
// TODO: _sqlForFilter under Company --> only used for filtering Companies
function sqlForFilter(dataToFilter) {
  console.log("in sqlForFilter");

  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) return {whereClause: "", values: []};

  const cols = [];
  const filterVals = [];

  if (dataToFilter.minEmployees) {
    filterVals.push(dataToFilter.minEmployees);
    cols.push(`"num_employees">=$${filterVals.length}`);
  }

  if (dataToFilter.maxEmployees) {
    filterVals.push(dataToFilter.maxEmployees);
    cols.push(`"num_employees"<=$${filterVals.length}`);
  }

  if (dataToFilter.nameLike) {
    filterVals.push(`%${dataToFilter.nameLike}%`);
    cols.push(`"name" ILIKE $${filterVals.length}`);
  }

  console.log(filterVals);

  return {
    whereClause: `WHERE ${cols.join(" AND ")}`,
    values: filterVals,
  };
}


module.exports = { sqlForPartialUpdate, sqlForFilter };
