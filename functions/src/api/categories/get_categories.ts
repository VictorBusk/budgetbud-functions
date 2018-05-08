import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.query.budgetID)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const budgetID = String(req.query.budgetID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categories").where("budgetID", "==", budgetID).get();
        } catch (err) {
            res.status(422).send({error: translator.t('categoryFetchFailed')});
        }

        const categoryArray = [];

        querySnapshot.forEach((doc) => {
            if (doc.data().amount > 0) {
                categoryArray.push({id: doc.id, categoryData: doc.data()});
            }
        });

        res.status(200).send(categoryArray);
    })
};
