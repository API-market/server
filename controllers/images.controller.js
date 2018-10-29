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
				entityId: req.body.entityId || 0,
				entityType: req.body.entityType || 'Image',
				name: req.body.name || 'Name',
				key: 'crop',
				imageUrl: UploadS3Service.getImage(cropped.file),
				originalImageUrl: UploadS3Service.getImage(original.file),
			});

			return res.sendResponse(image)
		}catch(e){
			next(e)
		}

	}

	async update(req, res, next) {
		try{
			const userId = req.auth.user_id;
			const imageEntity = await ImagesService.getImageById(req.params.imageId);

			if(!imageEntity) throw errors.notFound(`Image ${req.params.imageId} not exists`);
			if(imageEntity.userId !== userId) throw errors.forbidden(`You can edit only your own images`);

			await imageEntity.update(req.body);
			return res.sendResponse(imageEntity)
		}catch(e){
			next(e)
		}
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
