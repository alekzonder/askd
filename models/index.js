var _ = require('lodash');

module.exports = (config, di) => {

    return new Promise((resolve, reject) => {

        var db = di.getConnection('db');

        var M = {
            Questions: require('./Questions'),
            Answers: require('./Answers')
        };

        var models = {
            questions: new M.Questions(db),
            answers: new M.Answers(db)
        };

        _.each(models, (model) => {
            model.init();

            if (di.debug && model.setDebugger) {
                model.setDebugger(di.debug);
            }
        });

        models.ensureIndexes = function () {
            var promises = [];

            for (var name in models) {

                var model = models[name];

                if (model.ensureIndexes && typeof model.ensureIndexes === 'function') {
                    promises.push(model.ensureIndexes());
                }

            }

            return Promise.all(promises);
        };

        resolve(models);

    });

};
