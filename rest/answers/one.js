var joi = require('joi');
var _ = require('lodash');

module.exports = {

    resource: '/answers/:id',

    title: 'get answers by id',

    methods: {

        GET: {
            title: 'get answers by id',

            schema: {
                path: {
                    ':id': joi.string().required()
                }
            },

            onlyPrivate: false,

            callback: function(req, res) {
                var logger = req.di.logger;
                var api = req.di.api;

                api.questions.getById(req.params.id)
                    .then((question) => {
                        if (!question) {
                            throw api.questions.NotFoundError();
                        }

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