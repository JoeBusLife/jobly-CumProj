const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
	data = {
		bacon: "yes", freedom: true, blueDoors: true, isAdmin: "who knows"
	}

  test("", function () {
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
