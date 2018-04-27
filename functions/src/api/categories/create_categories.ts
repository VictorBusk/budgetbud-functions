import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')});
        }

        // Verify that the user provided an income
        if (!req.body.categories || !req.body.budgetID)
            return res.status(422).send({error: translator.t('errorInRequest')});

        const db = admin.firestore();
        const categories = req.body.categories;
        const budgetID = String(req.body.budgetID);

        categories.forEach(categoryDoc => {
            const categoryTypeID = String(categoryDoc.categoryTypeID);
            const categoryAmount = parseInt(categoryDoc.amount);
            if (categoryAmount > 0) {
                db.collection('categories').doc().set({
                    categoryTypeID,
                    amount: categoryAmount,
                    budgetID
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: translator.t('categoryCreationFailed')}));
            }
        });
    })
};