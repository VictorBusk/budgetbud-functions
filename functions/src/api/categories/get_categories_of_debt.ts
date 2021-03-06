import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.query.debtID)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const debtID = String(req.query.debtID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categoryDebts").where("debtID", "==", debtID).get();
        } catch (err) {
            res.status(422).send({error: translator.t('categoryFetchFailed')});
        }

        const categories = [];

        querySnapshot.forEach((doc) => {
            categories.push({
                categoryID: doc.data().categoryID,
                amount: doc.data().amount
            });
        });

        res.status(200).send(categories);
    })
};
