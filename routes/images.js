const express = require('express');
const {imagesController} = require('lumeos_controllers');

const router = express.Router();

router.route('/images').get(
	imagesController.list,
);

router.route('/images/:imageId').get(
	imagesController.get,
);

router.route('/images').post(
	imagesController.create,
);

router.route('/images/:imageId').put(
	imagesController.update,
);

router.route('/images/:imageId').delete(
	imagesController.delete,
);


module.exports = router;
