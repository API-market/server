const multer = require('multer');
const mime = require('mime-types');
const sharp = require('sharp');
const {UploadS3Service} = require('lumeos_services');

class UploadService {

    constructor() {
        this.uploadMulter = multer();
        this.ext = mime.extension;
        this.cropInstan = null;
        this.width = 200;
    }

    middleware(fieldName = 'avatar') {
        return this.uploadMulter.single(fieldName)
    }

    upload(file, dir) {
        if (typeof file === "object") {
            return new Promise((resolve, reject) => {
                this.crop(file)
                    .then((file) => {
                        UploadS3Service
                            .upload(file, dir)
                            .then((data) => {
                                resolve(data);
                            }).catch(reject);
                    })
                    .catch(reject)
            });
        }
        //TODO if image not required
        return Promise.resolve({file: null});
    }

	uploadCroppedAndOriginal(file, dir) {
		if (typeof file === "object") {
			const original = Object.assign({}, file);

			return new Promise((resolve, reject) => {
				this.crop(file)
				.then(file => Promise.all([
					UploadS3Service.upload(original, dir),
					UploadS3Service.upload(file, dir)
				]))
				.then(([original, cropped]) => resolve({cropped, original}))
				.catch(reject)
			});
		}

		//TODO if image not required
		return Promise.resolve({cropped: {file: null}, original: {file: null}});
	}

    crop(file) {
        return new Promise((resolve, reject) => {
            this.file = file;

            this.cropInstan = sharp(this.file.buffer)
                .resize(this.width);
            this.compress()
                .toBuffer(`./img.${this.file.ext}`, (err, buffer) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(Object.assign(this.file, {buffer}));
                })
        });
    }

    compress() {
        const ext = this.ext(this.file.mimetype);
        Object.assign(this.file, {ext});
        switch (ext) {
            case 'png': {
                return this.cropInstan.png({compressionLevel: 9});
            }
            case 'jpeg': {
                return this.cropInstan.jpeg({quality: 80});
            }
            default: {
                return this.cropInstan.png({compressionLevel: 9});
            }
        }
    }
}

module.exports = new UploadService();
