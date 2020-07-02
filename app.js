const debug = require('debug')('app');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const w3id = require('w3id-middleware');
const whitelist = require(`${__dirname}/bin/middleware/whitelist`);
const keyProtect = require(`${__dirname}/bin/middleware/checkAPIKey`);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());

app.get('/__gtg', (req, res) => { res.end(); });

// API Key Management Endpoints
app.use('/keys', [w3id, whitelist], require(`${__dirname}/routes/keyManagement`));
app.all('/__auth', w3id);

app.use('/', keyProtect, require(`${__dirname}/routes/index`));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	debug(err);

	// render the error page
	res.status(err.status || 500);
	res.end();
});

module.exports = app;
