module.exports = (config, models, di) => {

    return new Promise((resolve, reject) => {

        var A = {
            Questions: require('./Questions'),
            Answers: require('./Answers'),
            Users: require('./Users')
        };

        var api = {};

        api.questions = new A.Questions({}, models, api);
        api.answers = new A.Answers({}, models, api);
        api.users = new A.Users({}, models, api);

        for (var name in api) {
            if (di.debug && api[name].setDebugger) {
                api[name].setDebugger(di.debug);
            }
        }

        api.createTest = () => {

            return new Promise((resolve, reject) => {
                api.checkTasks.createTest()
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });

        };

        resolve(api);

    });

};
