const semver = require('semver');
const minSupportedVersion = process.env.MIN_CLIENT_VERSION || '1.0.3';

class VersionsController {

    get(req, res, next) {
		const isVersionSupported = semver.gte(req.params.version, minSupportedVersion);
		res.json({supported: isVersionSupported});
    }

}

module.exports = new VersionsController();
