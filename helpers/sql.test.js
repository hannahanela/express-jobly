"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const { sqlForPartialUpdate } = require("./sql");

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
      throw new Error("you should not be here!");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});