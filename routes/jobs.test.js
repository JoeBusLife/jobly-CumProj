"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
	u2Token,
	jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
		title: "new job",
		salary: 119000,
		equity: 0.7,
		companyHandle: 'c1'
	};

  test("works for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {...newJob, id: expect.any(Number), equity: "0.7"}
    });
  });

	test("unauth for non admin user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          equity: 2,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon: no filters", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
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
          ],
    });
	});

	test("ok for anon: all valid filters", async function () {
		const resp = await request(app).get("/jobs?title=2&minSalary=2000&hasEquity=true");
		expect(resp.body).toEqual({
			jobs:
					[
						{
							id: expect.any(Number),
							title: "job2",
							salary: 2000,
							equity: "0.2",
							companyHandle: 'c1',
						},
					],
		});
  });

	test("ok for anon: maxEmployees filter", async function () {
		const resp = await request(app).get("/jobs?minSalary=3001");
		expect(resp.body).toEqual({
			jobs:
					[
						{
							id: expect.any(Number),
							title: "job1",
							salary: 5000,
							equity: "0.5",
							companyHandle: 'c2',
						},
						{
							id: expect.any(Number),
							title: "job3",
							salary: 4000,
							equity: "0",
							companyHandle: 'c1',
						},
					],
		});
  });

	test("ok for anon: non existant filter", async function () {
		const resp = await request(app).get("/jobs?what=c");
		expect(resp.statusCode).toEqual(400);
  });

	test("ok for anon: empty filter value", async function () {
		const resp = await request(app).get("/jobs?title=");
		expect(resp.statusCode).toEqual(400);
  });

	test("ok for anon: hasEquity set to something other than true or false", async function () {
		const resp = await request(app).get("/jobs?hasEquity=tralse");
		expect(resp.statusCode).toEqual(400);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
				id: jobIds[0],
				title: "job1",
				salary: 1000,
				equity: "0.1",
				companyHandle: 'c1',
			},
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "stack cheese",
					salary: 9999999,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
				title: "stack cheese",
				salary: 9999999,
				equity: "0.1",
				companyHandle: 'c1',
      },
    });
  });

	test("unauth for non admin user", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "stack cheese",
        })
				.set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "stack cheese",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "stack cheese",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on companyHandle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          companyHandle: "c1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          equity: 3,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
	test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: jobIds[0] });
  });

  test("unauth for non admin user", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
