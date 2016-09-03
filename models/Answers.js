'use strict';

var Abstract = require('./Abstract');

class Answers extends Abstract {

    constructor(db) {
        super(db);

        this._collectionName = 'answers';

        this._indexes = [
            {
                fields: {
                    questionId: 1
                },
                options: {
                    name: 'questionId',
                    unique: false,
                    background: true
                }
            },
            {
                fields: {
                    deleted: 1,
                    creationDate: -1
                },
                options: {
                    name: 'deleted__creationDate',
                    unique: false,
                    background: true
                }
            }
        ];
    }

}

module.exports = Answers;
