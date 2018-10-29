const { schools } = require('lumeos_models');

class SchoolsController {

    list(req, res, next) {
		schools.findAll()
		.then(schools => res.sendResponse(schools))
		.catch(next);
    }

}

module.exports = new SchoolsController();
