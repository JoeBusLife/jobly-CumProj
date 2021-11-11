const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteringCompanies,sqlForFilteringJobs } = require("./sql");


describe("sqlForPartialUpdate", function () {
	const data = {
		bacon: "yes", freedom: true, blueDoors: true, isAdmin: "who knows"
	}

  test("Check generated SQL for partial update", function () {
    const res = sqlForPartialUpdate(
      data,
      {
        blueDoors: "blue_doors",
        redDoors: "red_doors",
        isAdmin: "is_admin",
      });
		
			expect(res).toEqual({
				setCols: '"bacon"=$1, "freedom"=$2, "blue_doors"=$3, "is_admin"=$4',
				values: ["yes", true, true, "who knows"]
			});
  });

	
});


describe("sqlForFilteringCompanies", function () {
	let name = 'mor';
	let minEmployees = 25;
	let maxEmployees = 400;

  test("Using all filters", function () {
    const res = sqlForFilteringCompanies({name, minEmployees, maxEmployees});
		
			expect(res).toEqual({
				where: 'WHERE num_Employees >= $1 and num_Employees <= $2 and name ILIKE $3',
				values: [25, 400, '%mor%']
			});
  });

	test("Using some filters", function () {
    const res = sqlForFilteringCompanies({name});
		
			expect(res).toEqual({
				where: 'WHERE name ILIKE $1',
				values: ['%mor%']
			});
  });

	test("No filters", function () {
    const res = sqlForFilteringCompanies(false);
		
			expect(res).toEqual({
				where: '',
				values: []
			});
  });
});


describe("sqlForFilteringJobs", function () {
	let title = 'acc';
	let minSalary = 5000;
	let hasEquity = 'true';

  test("Using all normal filters", function () {
    const res = sqlForFilteringJobs({title, minSalary, hasEquity});
		
			expect(res).toEqual({
				where: 'WHERE title ILIKE $1 and salary >= $2 and equity > 0',
				values: ['%acc%', 5000]
			});
  });

	test("Using some filters", function () {
    const res = sqlForFilteringJobs({title});
		
			expect(res).toEqual({
				where: 'WHERE title ILIKE $1',
				values: ['%acc%']
			});
  });

	test("Using companyHandle filter", function () {
    const res = sqlForFilteringJobs({companyHandle: 'tiny'});
		
			expect(res).toEqual({
				where: 'WHERE company_handle = $1',
				values: ['tiny']
			});
  });

	test("No filters", function () {
    const res = sqlForFilteringJobs(false);
		
			expect(res).toEqual({
				where: '',
				values: []
			});
  });
});
