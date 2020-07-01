const debug = require('debug')('routes:index');
const express = require('express');
const router = express.Router();
const mail = require(`${__dirname}/../bin/modules/mail`);

router.post('/send', function(req, res, next) {

	const requiredProperties = ['to', 'subject', 'text'];
	const missingParameters = requiredProperties.map(key => {

		if(!req.body[key]){
			return key;
		} else {
			return null;
		}

	}).filter(value => value !== null);

	if(missingParameters.length > 0){
		res.status(422);
		res.json({
			status : "err",
			msg : `Missing properties '${missingParameters.join("', '")}' from request.`
		});
	} else {

		mail.send(req.body)
			.then(function(){
				res.end();
			})
			.catch(err => {
				debug(err);
				res.status(500);
				res.json({
					status : "err",
					msg : "Failed to send email. Please check logs."
				})
			})
		;

	}

});

module.exports = router;
