const { images } = require('lumeos_models');
const { UploadService, ImagesService, UploadS3Service } = require('lumeos_services');
const { errors } = require('lumeos_utils');

class ImagesController {

    list(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
    }

	get(req, res, next) {

    	const imageId = req.params.imageId;

		images.findById(imageId)
		.then(image => {
			if(!image) throw errors.notFound(`Image ${imageId} not exists`);
			else return image;
		})
		.then(image => res.sendResponse(image))
		.catch(next);
	}

	async create(req, res, next) {

    	const userId = req.auth.user_id;

    	try{
			const {original, cropped} = await UploadService.uploadCroppedAndOriginal(req.file, `images/${userId}`);
			const image = await ImagesService.createImage({
				userId,
				entityId: req.entityId || 0,
				entityType: req.entityType || 'Image',
				name: req.name || 'Name',
				key: 'crop',
				imageUrl: UploadS3Service.getImage(cropped.file),
				originalImageUrl: UploadS3Service.getImage(original.file),
			});

			return res.sendResponse(image)
		}catch(e){
			next(e)
		}

	}

	update(req, res, next) {
		images.findAll()
		.then(images => res.sendResponse(images))
		.catch(next);
	}

	delete(req, res, next) {
		const imageId = req.params.imageId;

		images.findById(imageId)
		.then(image => {
			if(!image) throw errors.notFound(`Image ${imageId} not exists`);
			else return ImagesService.deleteImage(image);
		})
		.then(res.sendResponse)
		.catch(next);
	}

}

module.exports = new ImagesController();
