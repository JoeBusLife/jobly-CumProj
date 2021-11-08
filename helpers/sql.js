const { BadRequestError } = require("../expressError");


/** Creates dynamic SQL for updating a database entry based on fields to be changed.
   *
   * Returns { setCols, values }
   *
   * Throws BadRequestError for no data to update being provided.
   **/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}


/** Creates dynamic SQL for filitering a list of all companies
   *
   * Returns { where, values }
   *
   * Returns empty { where, values } if no filters are given
   **/

function sqlForFilteringCompanies(filters) {
	const values = [];
	// returns empty { where, values } if no filters are given
	if (!filters) return {where: "", values};

  const whereParams = [];
	let idx = 1;
		
	if (filters.minEmployees){
		whereParams.push(`num_Employees >= $${idx++}`);
		values.push(filters.minEmployees)
	}
	if (filters.maxEmployees){
		whereParams.push(`num_Employees <= $${idx++}`);
		values.push(filters.maxEmployees)
	}
	if (filters.name){
		whereParams.push(`name ILIKE $${idx++}`);
		values.push(`%${filters.name}%`)
	}
	
  return {
    where: where = `WHERE ` + whereParams.join(' and '),
    values
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilteringCompanies };