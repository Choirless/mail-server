const debug = require('debug')('bin:modules:mail');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendMail(msgInfo){

    const msg = {
        to: msgInfo.to,
        from: process.env.SENDGRID_SENDER,
        subject: msgInfo.subject,
        text: msgInfo.text,
        html : msgInfo.html
    };

    return sgMail.send(msg)
        .then(() => {}, err => {
            if(err){
                throw err;
            } else {

                return {
                    status : "ok"
                };

            }
        })
        .catch(err => {
            debug('sendMail err:', err);
            throw err;
        })
    ;

}

module.exports.send = sendMail