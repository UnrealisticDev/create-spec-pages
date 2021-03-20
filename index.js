const env = require('dotenv');
const fs = require('fs');
const path = require('path');
const contentful = require('contentful');

env.config();

function validateDestination(destination) {
	if (!fs.statSync(destination).isDirectory()) {
		throw new Error(`Destination directory [${destination}] does not exist.`);
	}

	try {
		fs.accessSync(destination, fs.constants.W_OK);
	} catch (error) {
		throw new Error(
			`Destination directory [${destination}] cannot be written to: ${error}`
		);
	}
}

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
	space: process.env.CONTENTFUL_SPACE_ID,
	environment: process.env.CONTENTFUL_ENVIRONMENT_ID,
});

function getSpecifierEntries() {
	try {
		return client.getEntries({
			content_type: 'unrealSpecifier',
			limit: 1000,
			select: ['fields.keyFriendly', 'fields.slug', 'sys.id'],
		});
	} catch (error) {
		console.error(error);
	}
}

function writeEntryToFile(writeStream, entry) {
	const { sys, fields } = entry;
	const { id } = sys;
	const { keyFriendly } = fields;

	// YAML block
	writeStream.write('---');
	writeStream.write('\n');

	writeStream.write(`id: ${id}`);
	writeStream.write('\n');

	writeStream.write(`title: ${keyFriendly}`);
	writeStream.write('\n');

	writeStream.write(`snippet: `);
	writeStream.write('\n');

	writeStream.write(`values: `);
	writeStream.write('\n');

	writeStream.write('---');
	writeStream.write('\n');
}

async function main() {
	const arguments = process.argv.slice(2); // Normalize arguments by excluding first two: node ${filename}
	const destination = arguments[0];
	validateDestination(destination);

	const specEntries = await getSpecifierEntries();
	specEntries.items.forEach((entry) => {
		const { slug } = entry.fields;
		const destinationFile = path.join(destination, slug + '.md');
		destinationFile.set;
		if (fs.existsSync(destinationFile)) {
			console.log(`Skipping [${destinationFile}]. Already exists.`);
		} else {
			console.log(`Creating [${destinationFile}].`);
			writeEntryToFile(fs.createWriteStream(destinationFile), entry);
		}
	});
}

main();
