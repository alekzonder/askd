'use strict';

var Abstract = require('./Abstract');
var joi = require('joi');
var moment = require('moment');
var _ = require('lodash');
var md5 = require('md5');

var ErrorCodes = require('maf/Api/ErrorCodes');

var apiError = require('mazaid-error/create')(ErrorCodes);

var Chain = require('maf/Chain');

class Questions extends Abstract {

    constructor(config, models, api) {
        super(models, api);

        this._config = config;

        this.entityName = 'question';

        this.ErrorCodes = ErrorCodes;

        this._creationSchema = function() {
            return {
                title: joi.string().required(),
                text: joi.string().required(),
                userId: joi.string().guid().required(),
                creationDate: joi.number().min(0).required(),
                modificationDate: joi.number().min(0).default(null).allow(null),
                deleted: joi.boolean().default(false)
            };
        };

        this._modificationSchema = function() {
            return {
                title: joi.string(),
                text: joi.string(),
                deleted: joi.boolean()
            };
        };

        this._systemFields = [
            '_id'
        ];
    }

    getCreationSchemaForRestApi() {
        return _.pick(this._creationSchema(), ['title', 'text']);
    }

    getModifcationSchemaForRestApi() {
        return _.pick(this._modificationSchema(), ['title', 'text']);
    }

    getById(id) {

        return new Promise((resolve, reject) => {
            this._model().findOne({_id: id})
                .then((doc) => {
                    resolve(doc);
                })
                .catch((error) => {
                    reject(error);
                });
        });

    }

    getByIdActive(id) {

        return new Promise((resolve, reject) => {
            this._model().findOne({_id: id, deleted: false})
                .then((doc) => {
                    resolve(doc);
                })
                .catch((error) => {
                    reject(error);
                });
        });

    }

    find(filters, fields) {

        var chain = new Chain({
            steps: {
                limit: 10,
                skip: 0,
                sort: null
            }
        });

        chain.onExec((data) => {

            return new Promise((resolve, reject) => {
                this._model().find(filters, fields)
                    .mapToChain(data)
                    .exec()
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            reject(error);
                        });
            });

        });

        return chain;

    }

    create(data) {

        return new Promise((resolve, reject) => {

            if (!data) {
                return reject(this.Error('empty data', this.ErrorCodes.INVALID_DATA));
            }

            // TODO
            data.userId = 'e47f21aa-1357-48b3-93c6-595e6f3c42bd';

            data.creationDate = this._time();
            data.modificationDate = null;
            data.deleted = false;

            this._validateCreation(data)
                .then((data) => {
                    return this._create(data);
                })
                .then((doc) => {
                    resolve(doc);
                })
                .catch((error) => {
                    if (error.name === 'ApiError' && error.code === ErrorCodes.INVALID_DATA) {
                        reject(
                            this.Error(error.message, error.code)
                                .setList(error.list)
                        );
                    } else {
                        reject(error);
                    }
                });
        });

    }

    createTest() {
        var data = {
            title: 'test',
            text: 'test'
        };

        return this.create(data);
    }

    updateById(id, data) {

        return new Promise((resolve, reject) => {
            if (this._isEmptyObject(data)) {
                return reject(this.Error('empty data', this.errorCodes.INVALID_DATA));
            }

            this.getById(id)
                .then((task) => {
                    if (!task) {
                        throw this.Error(
                            `${this.entityName} not found: id = ${id}`,
                            this.errorCodes.NOT_FOUND
                        );
                    }

                    return this._validateModification(data);
                })
                .then((valid) => {

                    if (this._isEmptyObject(data)) {
                        throw this.Error('empty data', this.errorCodes.INVALID_DATA);
                    }

                    valid.modificationDate = this._time();

                    return this._model().findOneAndUpdate({_id: id}, {$set: valid});
                })
                .then((updated) => {
                    resolve(updated);
                })
                .catch((error) => {
                    reject(error);
                });
        });

    }

    deleteById(id) {

        return new Promise((resolve, reject) => {

            this.getById(id)
                .then((doc) => {

                    if (!doc) {
                        throw this.Error(
                            `${this.entityName} not found: id = ${id}`,
                            this.errorCodes.NOT_FOUND
                        );
                    }

                    return this._model().findOneAndUpdate(
                        {
                            _id: id
                        },
                        {
                            $set: {
                                deleted: true,
                                modificationDate: this._time()
                            }
                        }
                    );
                })
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    reject(error);
                });
        });

    }

    _create (data, options) {

        return new Promise((resolve, reject) => {

            if (!data.id) {
                data.id = this._generateUuid();
            }

            this._model().insertOne(data)
                .then((doc) => {
                    resolve(doc);
                })
                .catch((error) => {
                    if (error.code && error.code === 'already_exists') {
                        reject(this.Error(`${this.entityName} already exists`, ErrorCodes.INVALID_DATA));
                    } else {
                        reject(error);
                    }
                });
        });

    }

    /**
     * @param {String} id
     *
     * @return {Error}
     */
    NotFoundError(id) {
        var message = this.entityName + ' not found';

        if (id) {
            message = `${this.entityName} with id = "${id}" not found`;
        }

        return this.Error(message, this.ErrorCodes.NOT_FOUND);
    }

    /**
     * base model of api
     *
     * @return {model}
     */
    _model() {
        return this._models.questions;
    }
}

module.exports = Questions;
