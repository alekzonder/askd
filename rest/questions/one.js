var joi = require('joi');
var _ = require('lodash');

module.exports = {

    resource: '/questions/:id',

    title: 'get questions by id',

    methods: {

        GET: {
            title: 'get questions by id',

            schema: {
                path: {
                    ':id': joi.string().required()
                }
            },

            onlyPrivate: false,

            callback: function(req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                var question;

                api.questions.getById(req.params.id)
                    .then((_question) => {
                        question = _question;

                        if (!question) {
                            throw api.questions.NotFoundError();
                        }

                        return Promise.all([
                            api.answers.getCountByActiveQuestions([question.id]),
                            api.users.getById(question.userId)
                        ]);
                    })
                    .then((result) => {
                        var user = result[1];

                        var users = {};

                        users[user.id] = {
                            login: user.login
                        };

                        // var userId = user['id'];

                        res.result(api.questions.clearSystemFields(question), {
                            answerCounts: result[0],
                            users: users
                        });
                    })
                    .catch((error) => {
                        var ec = {
                            questions: api.questions.ErrorCodes
                        };

                        if (!error.checkable) {
                            return res.logServerError(error);
                        }

                        error.checkChain(res.logServerError)
                            .ifEntity(api.questions.entityName)
                            .ifCode(ec.questions.NOT_FOUND, res.notFound)
                            .end()
                            .check();

                    });
            }
        },

        PATCH: {
            title: 'update questions by id',

            schema: {
                path: {
                    ':id': joi.string().required()
                },
                body: {}
            },

            prehook: function(method, di) {
                method.schema.body = di.api.questions.getModifcationSchemaForRestApi();
            },

            callback: function(req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                api.questions.getById(req.params.id)
                    .then((question) => {
                        if (!question) {
                            throw api.questions.NotFoundError();
                        }

                        return api.questions.updateById(question.id, req.body);
                    })
                    .then((question) => {
                        res.result(question);
                    })
                    .catch((error) => {
                        var ec = {
                            questions: api.questions.ErrorCodes
                        };

                        if (!error.checkable) {
                            return res.logServerError(error);
                        }

                        error.checkChain(res.logServerError)
                            .ifEntity(api.questions.entityName)
                            .ifCode(ec.questions.NOT_FOUND, res.notFound)
                            .end()
                            .check();

                    });
            }
        },

        DELETE: {
            title: 'delete question by id',

            schema: {
                path: {
                    ':id': joi.string().required()
                }
            },

            callback: function(req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                api.questions.getById(req.params.id)
                    .then((question) => {
                        if (!question) {
                            throw api.questions.NotFoundError();
                        }

                        return api.questions.updateById(question.id, {deleted: true});
                    })
                    .then((question) => {
                        res.result(question);
                    })
                    .catch((error) => {
                        var ec = {
                            questions: api.questions.ErrorCodes
                        };

                        if (!error.checkable) {
                            return res.logServerError(error);
                        }

                        error.checkChain(res.logServerError)
                            .ifEntity(api.questions.entityName)
                            .ifCode(ec.questions.NOT_FOUND, res.notFound)
                            .end()
                            .check();

                    });
            }
        }

    }
};