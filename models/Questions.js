'use strict';

var Abstract = require('./Abstract');

class Questions extends Abstract {

    constructor(db) {
        super(db);

        this._collectionName = 'questions';

        this._indexes = [
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

module.exports = Questions;
