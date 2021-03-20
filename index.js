const env = require('dotenv');
const contentful = require('contentful');

env.config();

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
	space: process.env.CONTENTFUL_SPACE_ID,
	environment: process.env.CONTENTFUL_ENVIRONMENT_ID,
});
