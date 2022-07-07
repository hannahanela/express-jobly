"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const { sqlForPartialUpdate, sqlForFilter } = require("./sql");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("../models/_testCommon");
const { BadRequestError } = require("../expressError.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************** sqlForPartialUpdate(dataToUpdate, jsToSql) */

describe("sqlForPartialUpdate method", function () {
  test("partial update returns correctly", function () {

    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: "first_name" };
    const res = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(res).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32]
    });
  });

  test("partial update fails, returns error if not valid inputs", function () {
    const dataToUpdate = {};
    const jsToSql = { firstName: "first_name" };
    try {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
      // TODO: throw new error (shouldn't reach point)
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});
// TODO: additional refactoring for jsToSql changes.
describe("sqlForFilter method", function () {
  test("filter for 3 input returns correctly", function () {

    const dataToFilter = {
      minEmployees: 1,
      nameLike: 'C1',
      maxEmployees: 3,
    };

    const jsToSql = {
      minEmployees: 'num_employees',
      maxEmployees: 'num_employees',
      nameLike: 'name'
    };

    const res = sqlForFilter(dataToFilter, jsToSql);
    expect(res).toEqual({
      whereClause: `WHERE "num_employees">=$1 AND "num_employees"<=$2 AND "name" ILIKE $3`,
      values: [1, 3, "%C1%"]
    });
  });

  test("filter for nameLike returns correctly", function () {
    const dataToFilter = {
      nameLike: 'C1'
    };

    const jsToSql = {
      minEmployees: 'num_employees',
      maxEmployees: 'num_employees',
      nameLike: 'name'
    };

    const res = sqlForFilter(dataToFilter, jsToSql);
    expect(res).toEqual({
      whereClause: `WHERE "name" ILIKE $1`,
      values: ["%C1%"]
    });
  });

  test("filter for minEmployees returns correctly", function () {
    const dataToFilter = {
      minEmployees: 2,
    };

    const jsToSql = {
      minEmployees: 'num_employees',
      maxEmployees: 'num_employees',
      nameLike: 'name'
    };

    const res = sqlForFilter(dataToFilter, jsToSql);
    expect(res).toEqual({
      whereClause: `WHERE "num_employees">=$1`,
      values: [2]
    });
  });

  test("filter for maxEmployees returns correctly", function () {
    const dataToFilter = {
      maxEmployees: 2,
    };

    const jsToSql = {
      minEmployees: 'num_employees',
      maxEmployees: 'num_employees',
      nameLike: 'name'
    };

    const res = sqlForFilter(dataToFilter, jsToSql);
    expect(res).toEqual({
      whereClause: `WHERE "num_employees"<=$1`,
      values: [2]
    });
  });
// TODO: make changes for refactoring
  test("return null if input is empty", function () {
    const dataToFilter = {};

    const jsToSql = {
      minEmployees: 'num_employees',
      maxEmployees: 'num_employees',
      nameLike: 'name'
    };

    const res = sqlForFilter(dataToFilter, jsToSql);
    expect(res).toEqual(null);
  });

});