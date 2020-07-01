const debug = require('debug')('keyManagement');
const Nano = require('nano');
const router = require('express').Router();
const kuuid = require('kuuid');
const path = require('path');

const nano = Nano(process.env.COUCH_URL)
const db = nano.db.use(process.env.COUCH_KEYS_DATABASE);

router.get('/', (req, res, next) => {
	res.sendFile(path.resolve(`${__dirname}/../static/key-management.html`));
});

router.post('/create', async (req, res, next) => {
  debug(req.body)

  if (req.body.keyname) {
	const keyDetails = {
		_id: kuuid.id(),
		owner: res.locals.w3id_userid,
		name: req.body.keyname,
		created: Date.now(),
		service: process.env.SERVICE_NAME
	};

	await db.insert(keyDetails)

	res.json({
		status: 'ok',
		msg: 'Key successfully created',
		data: keyDetails
	})
  } else {
	res.status(401)
	res.json({
		status: 'err',
		msg: 'Required parameters not passed'
	})
  }
})

router.post('/delete', async (req, res, next) => {
  if (req.body.key) {
	const existingKey = await db.get(req.body.key)

	if (existingKey) {
		await db.destroy(existingKey._id, existingKey._rev)

		res.json({
			status: 'ok',
			msg: `Key "${req.body.key} deleted"`
		})
	} else {
		res.status(422)
		res.json({
			status: 'err',
			msg: `Key "${req.body.key} could not be found for deletion"`
		})
	}
  } else {
	res.status(422)
	res.json({
		status: 'err',
		msg: 'No key was passed for deletion'
	})
  }
})

router.get('/list', async (req, res, next) => {
  const whitelistProperties = ['_id', 'owner', 'name', 'created']

  const keys = await db.list({ include_docs: true }).then((result) => {
	
	const sanitisedOutput = result.rows.map(entry => {
		
		let sanitisedDoc = null;

		debug(entry, entry.doc.service, process.env.SERVICE_NAME);

		if(entry.doc.service === process.env.SERVICE_NAME){

			sanitisedDoc = {};
	
			whitelistProperties.forEach(key => {
				sanitisedDoc[key] = entry.doc[key]
			});
	
		}

		return sanitisedDoc;
		
	}).filter(doc => {
		return doc !== null;
	});

	return sanitisedOutput;

  })

  res.json({
	status: 'ok',
	data: keys
  })
})
module.exports = router
