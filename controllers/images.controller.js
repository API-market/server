const { images } = require('lumeos_models');

class SchoolsController {

    list(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
    }

	get(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
	}

	create(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
	}

	update(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
	}

	delete(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
	}

}

module.exports = new SchoolsController();
