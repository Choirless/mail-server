const debug = require('debug')('app:middleware:checkAPIKey');
const Nano = require('nano');
const nano = Nano(process.env.COUCH_URL);
const db = nano.db.use(process.env.COUCH_KEYS_DATABASE);
const LRU = require("lru-cache");

// cache of API keys
const keyCache = new LRU({
    max: 100,
    length: function (n, key) { return n * 2 + key.length },
    maxAge: 1000 * 30 // 30 seconds
});

async function checkAPIKey (req, res, next) {
  if (req.query.apikey) {
    // if we've seen this key before, use the cached key
    let storedKey = keyCache.get(req.query.apikey);
    if (!storedKey) {
      // otherwise fetch from database
      try{
          storedKey = await db.get(req.query.apikey);
      } catch(err){
          debug(`Could not find API key "${req.query.apikey}"`, err);
          storedKey = null;
      }

      debug(storedKey);

      keyCache.set(req.query.apikey, storedKey);
    }

    if (storedKey && storedKey.service === process.env.SERVICE_NAME) {
      next();
    } else {
      res.status(401);
      res.json({
        ok: false,
        status: 'err',
        msg: 'Invalid API key'
      })
    }
  } else {
    res.status(422)
    res.json({
      ok: false,
      status: 'err',
      msg: 'No API key was passed with the request. Please append it to your request url with ?apikey=<YOUR_API_KEY>'
    })
  }
}

module.exports = checkAPIKey
