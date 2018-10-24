const express = require('express');
const {imagesController} = require('lumeos_controllers');
const {auth} = require('lumeos_middlewares');
const {UploadService} = require('lumeos_services');

const router = express.Router();

router.route('/images').get(
	imagesController.list,
);

router.route('/images/:imageId').get(
	imagesController.get,
);

router.route('/images').post(
	auth,
	UploadService.middleware('image'),
	imagesController.create,
);

router.route('/images/:imageId').put(
	imagesController.update,
);

router.route('/images/:imageId').delete(
	imagesController.delete,
);


module.exports = router;
