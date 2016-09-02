var joi = require('joi');
var _ = require('lodash');

module.exports = {

    resource: '/questions',

    title: 'find and create questions',

    methods: {
        GET: {
            title: 'find questions',

            schema: {
                query: {
                    limit: joi.number().default(10).min(0).max(100),
                    offset: joi.number().default(0).min(0).max(100)
                }
            },

            callback: function (req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                var filters = {};

                var request = api.questions.find(filters);

                request.limit(req.query.limit).skip(req.query.offset);

                request.sort({creationDate: -1});

                request.exec()
                    .then((result) => {
                        var docs = [];

                        for (var doc of result.docs) {
                            docs.push(api.questions.clearSystemFields(doc));
                        }

                        res.result(docs, {
                            resultset: {
                                count: result.docs.length,
                                total: result.total,
                                limit: req.query.limit,
                                offset: req.query.offset
                            }
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
                method.schema.body = di.api.questions.getCreationSchemaForRestApi();
            },

            callback: function (req, res) {
                var logger = req.di.logger;
                var api = req.di.api;


                api.questions.create(req.body)
                    .then((question) => {
                        res.result(api.questions.clearSystemFields(question));
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
                           .ifCode(ec.questions.INVALID_DATA, res.badRequest)
                           .ifCode(ec.questions.ALREADY_EXISTS, res.badRequest)
                           .end()
                           .check();
                    });
            }
        }
    }
};
