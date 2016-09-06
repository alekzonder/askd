var joi = require('joi');
var _ = require('lodash');

module.exports = {

    resource: '/answers',

    title: 'find and create answers',

    methods: {
        GET: {
            title: 'find answers',

            schema: {
                query: {
                    questionId: joi.string().required(),
                    limit: joi.number().default(10).min(0).max(100),
                    offset: joi.number().default(0).min(0).max(100)
                }
            },

            callback: function (req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                var filters = {};

                if (req.query.questionId) {
                    filters.questionId = req.query.questionId;
                }

                var request = api.answers.find(filters);

                request.limit(req.query.limit).skip(req.query.offset);

                request.sort({creationDate: -1});

                var docs = [], answers;

                request.exec()
                    .then((result) => {

                        answers = result;

                        var userIds = [];

                        for (var doc of answers.docs) {
                            docs.push(api.answers.clearSystemFields(doc));
                            userIds.push(doc.userId);
                        }

                        return api.users.findByIds(userIds);
                    })
                    .then((users) => {
                        res.result(docs, {
                            resultset: {
                                count: answers.docs.length,
                                total: answers.total,
                                limit: req.query.limit,
                                offset: req.query.offset
                            },
                            users: users
                        });
                    })
                    .catch((error) => {
                        var ec = {
                            answers: api.answers.ErrorCodes
                        };

                        if (!error.checkable) {
                            return res.logServerError(error);
                        }

                        error.checkChain(res.logServerError)
                           .check();
                    });
            }
        },

        POST: {
            title: 'create',

            schema: {
                body: {}
            },

            preHook: function (method, di) {
                method.schema.body = di.api.answers.getCreationSchemaForRestApi();
            },

            callback: function (req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                api.questions.getByIdActive(req.body.questionId)
                    .then((question) => {
                        if (!question) {
                            throw api.questions.NotFoundError();
                        }

                        return api.answers.create(req.body);
                    })
                    .then((answer) => {
                        res.result(api.answers.clearSystemFields(answer));
                    })
                    .catch((error) => {
                        var ec = {
                            questions: api.questions.ErrorCodes,
                            answers: api.answers.ErrorCodes
                        };

                        if (!error.checkable) {
                            return res.logServerError(error);
                        }

                        error.checkChain(res.logServerError)
                           .ifEntity(api.answers.entityName)
                           .ifCode(ec.answers.INVALID_DATA, res.badRequest)
                           .ifCode(ec.answers.ALREADY_EXISTS, res.badRequest)
                           .end()
                           .ifEntity(api.questions.entityName)
                           .ifCode(ec.questions.NOT_FOUND, res.notFound)
                            .end()
                           .check();
                    });
            }
        }
    }
};
