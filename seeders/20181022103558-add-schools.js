'use strict';

const schools = [
	{name: 'Harvard', emailDomain: 'harvard.edu'},
	{name: 'Yale', emailDomain: 'yale.edu'},
	{name: 'Stanford', emailDomain: 'stanford.edu'},
	{name: 'MIT', emailDomain: 'mit.edu'},
	{name: 'Duke University', emailDomain: 'duke.edu'},
	{name: 'California Institute of Technology', emailDomain: 'caltech.edu'},
	{name: 'University of Pennsylvania', emailDomain: 'upenn.edu'},
	{name: 'Columbia University', emailDomain: 'columbia.edu'},
	{name: 'Brown University', emailDomain: 'brown.edu'},
	{name: 'University of Chicago', emailDomain: 'uchicago.edu'},
	{name: 'University of California, Berkeley', emailDomain: 'berkeley.edu'},
	{name: 'Cornell', emailDomain: 'cornell.edu'},
	{name: 'Oxford Univ. (UK School)', emailDomain: 'ox.ac.uk'},
	{name: 'Princeton', emailDomain: 'princeton.edu'},
];

module.exports = {
	up: (queryInterface, Sequelize) => {

		return queryInterface.bulkInsert('schools', schools, {ignoreDuplicates: true})
			.catch(console.error)
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('schools', {}, {});
	}
};
