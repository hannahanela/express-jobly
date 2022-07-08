"use strict";

const req = require("express/lib/request");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** _sqlForFilter: creates object of table columns and the values to be
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

  static _sqlForFilter(dataToFilter) {
    console.log("in sqlForFilter");

    const keys = Object.keys(dataToFilter);
    if (keys.length === 0) return { whereClause: "", values: [] };

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

  /** Find all companies.
   *
   *  Allows for filtering by name, minEmployee, or maxEmployee. Optional for
   *    method.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(queryParams) {
    console.log("in findAll", queryParams);

    const { whereClause, values } = this._sqlForFilter(
      queryParams,
      {
        minEmployees: 'num_employees',
        maxEmployees: 'num_employees',
        nameLike: 'name'
      });

    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
             FROM companies
             ${whereClause}
             ORDER BY name`, values);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
