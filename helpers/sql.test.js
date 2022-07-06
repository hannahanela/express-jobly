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
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

describe("sqlForFilter method", function () {
  test("filter for 3 input returns correctly", function () {

    const dataToFilter = {
      minEmployees: 2,
      maxEmployees: 4,
      nameLike: 'Aliya'
    };
    const res = sqlForFilter(dataToFilter);
    expect(res).toEqual({
      whereCols: 'num_employees > $1, num_employees < $2, name ILIKE $3',
      values: [2, 4, "%Aliya%"]
    });
  });

  test("filter for nameLike returns correctly", function () {
    const dataToFilter = {
      nameLike: 'Aliya'
    };
    const res = sqlForFilter(dataToFilter);
    expect(res).toEqual({
      whereCols: 'name ILIKE $1',
      values: ["%Aliya%"]
    });
  });

  test("partial update fails, returns error if not valid inputs", function () {
    const dataToUpdate = {};
    const jsToSql = { firstName: "first_name" };
    try {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  // only passed nameLike --> returns what?
  // only passed minEmp (and not maxEmp)
  //

});