'use strict';

var Abstract = require('./Abstract');

class Questions extends Abstract {

    constructor(db) {
        super(db);

        this._collectionName = 'questions';

        this._indexes = [
            // {
            //     fields: {
            //         creationDate: -1
            //     },
            //     options: {
            //         name: 'creationDate',
            //         unique: false,
            //         background: true
            //     }
            // }
        ];
    }

}

module.exports = Questions;
