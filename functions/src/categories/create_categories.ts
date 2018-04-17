import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.categories || !req.body.budgetID)
                    return res.status(422).send({error: 'Fejl i anmodningen.'});

                const db = admin.firestore();
                const categories = req.body.categories;
                const budgetID = String(req.body.budgetID);

                categories.forEach(categoryDoc => {
                    const categoryTypeID = String(categoryDoc.name);
                    const categoryAmount = parseInt(categoryDoc.amount);
                    if (categoryAmount > 0) {
                        db.collection('categories').doc().set({
                            categoryTypeID,
                            amount: categoryAmount,
                            budgetID
                        })
                            .then(() => res.status(200).send({success: true}))
                            .catch(err => res.status(422)
                                .send({error: 'Kunne ikke oprette kategori.'}));
                    }
                })
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
