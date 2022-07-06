"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************** sqlForPartialUpdate(dataToUpdate, jsToSql) */

describe("sqlForPartialUpdate method", function() {
    test("works ")
});

// works
// compare: get back object with string and array for values

// if an object isn't given
// test for line 19 error message