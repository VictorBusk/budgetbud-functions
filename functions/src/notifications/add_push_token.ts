import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')})
        }

        if (!req.body.cprNumber || !req.body.pushToken)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const cprNumber = String(req.body.cprNumber);
        const pushToken = String(req.body.pushToken);
        const db = admin.firestore();

        let userDoc;
        try {
            userDoc = await db.collection("users").doc(cprNumber).get();
        } catch (err) {
            res.status(401).send({error: translator.t('userDataFetchFailed')})
        }

        if (!userDoc.exists)
            return res.status(400).send({error: translator.t('userNotRegistered')});

        try {
            await userDoc.ref.update({pushToken});
            res.status(200).send({success: true});
        } catch (err) {
            res.status(401).send({error: translator.t('permissionUpdateFailed')})
        }
    });
};
