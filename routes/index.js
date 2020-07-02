const debug = require('debug')('routes:index');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const mail = require(`${__dirname}/../bin/modules/mail`);
const Handlebars = require('handlebars');

const templates = {};

router.post('/send', function(req, res) {

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

router.post('/send/:TEMPLATE', function(req, res, next) {

	const validTemplates = ['welcome', 'forgot-password', 'invitation'];

	if(validTemplates.indexOf(req.params.TEMPLATE) === -1){
	
		res.status(422);
		res.json({
			status : "err",
			msg : `Invalid template type passed. Valid template types are '${validTemplates.join("', '")}'.`
		});
	
	} else {

		if(!templates[req.params.TEMPLATE]){
			
			const source = fs.readFileSync(`${__dirname}/../views/${req.params.TEMPLATE}.hbs`, 'utf8');
			templates[req.params.TEMPLATE] = Handlebars.compile(source);

		}

		req.body.html = templates[req.params.TEMPLATE](req.body.info);
		
		res.send(req.body.html);

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
