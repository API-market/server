const { images } = require('lumeos_models');
const { UploadS3Service, UploadService } = require('lumeos_services');

class ImagesService {

	static async updateImage(imageEntity) {
		return await images.update(imageEntity);
	}

	static async createImage(imageParams) {
		return await images.create(imageParams);
	}

	static async deleteImage(imageEntity) {

		const [originalDeleted, croppedDeleted] = await Promise.all([
			UploadS3Service.delete(imageEntity.originalImageUrl),
			UploadS3Service.delete(imageEntity.imageUrl)
		]);

		return await images.destroy({ where: {imageId: imageEntity.imageId}});

	}

}

module.exports = ImagesService;
