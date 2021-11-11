"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const newJob = {
	title: "new job",
	salary: 119000,
	equity: 0.7,
	companyHandle: 'c1'
};

/************************************** create */

describe("create", function () {
  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
			id: expect.any(Number),
			title: "new job",
			salary: 119000,
			equity: "0.7",
			companyHandle: 'c1'
		});

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new job'`);
    expect(result.rows).toEqual([
      {
				id: expect.any(Number),
        title: "new job",
				salary: 119000,
				equity: "0.7",
				companyHandle: 'c1'
      },
    ]);
  });

  test("duplicates ok", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeFalsy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
	let title = '2';
	let minSalary = 2000;
	let hasEquity = "true";

  test("works: no filter", async function () {
		let filters = false;
    let jobs = await Job.findAll(filters);
    expect(jobs).toEqual([
      {
				id: expect.any(Number),
				title: "job1",
				salary: 1000,
				equity: "0.1",
				companyHandle: 'c1',
			},
			{
				id: expect.any(Number),
				title: "job1",
				salary: 5000,
				equity: "0.5",
				companyHandle: 'c2',
			},
			{
				id: expect.any(Number),
				title: "job2",
				salary: 2000,
				equity: "0.2",
				companyHandle: 'c1',
			},
			{
				id: expect.any(Number),
				title: "job2",
				salary: 3000,
				equity: "0",
				companyHandle: 'c2',
			},
			{
				id: expect.any(Number),
				title: "job3",
				salary: 4000,
				equity: "0",
				companyHandle: 'c1',
			},
    ]);
  });

	test("works: all filters", async function () {
		let filters = {title, minSalary, hasEquity};
    let jobs = await Job.findAll(filters);
    expect(jobs).toEqual([
      {
				id: expect.any(Number),
				title: "job2",
				salary: 2000,
				equity: "0.2",
				companyHandle: 'c1',
			},
    ]);
  });

	test("works: some filters", async function () {
		let filters = {minSalary, hasEquity};
    let jobs = await Job.findAll(filters);
    expect(jobs).toEqual([
      {
				id: expect.any(Number),
				title: "job1",
				salary: 5000,
				equity: "0.5",
				companyHandle: 'c2',
			},
			{
				id: expect.any(Number),
				title: "job2",
				salary: 2000,
				equity: "0.2",
				companyHandle: 'c1',
			},
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
		let resNewJob = await Job.create(newJob);
    let job = await Job.get(resNewJob.id);
    expect(job).toEqual({
			id: expect.any(Number),
			title: "new job",
			salary: 119000,
			equity: "0.7",
			companyHandle: 'c1'
		});
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "new job 10x",
    salary: 2119000,
    equity: 0.77,
  };

  test("works", async function () {
		const {id} = await Job.create(newJob);
    let job = await Job.update(id, updateData);
    expect(job).toEqual({
			id: expect.any(Number),
      title: "new job 10x",
    	salary: 2119000,
    	equity: "0.77",
			companyHandle: 'c1'
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${id}`);
    expect(result.rows).toEqual([{
      id: id,
      title: "new job 10x",
    	salary: 2119000,
    	equity: "0.77",
			companyHandle: 'c1'
    }]);
  });

  test("works: some fields", async function () {
    const updateSomeDataSet = {
      salary: 12,
      equity: 0,
    };

		const {id} = await Job.create(newJob);
    let job = await Job.update(id, updateSomeDataSet);
    expect(job).toEqual({
				id: id,
				title: "new job",
				salary: 12,
				equity: "0",
				companyHandle: 'c1'
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${id}`);
    expect(result.rows).toEqual([{
			id: id,
      title: "new job",
      salary: 12,
      equity: "0",
      companyHandle: 'c1',
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(9999, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
		const {id} = await Job.create(newJob);
    await Job.remove(id);
    const res = await db.query(
        `SELECT title FROM jobs WHERE id=${id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
