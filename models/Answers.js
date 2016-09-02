'use strict';

var Abstract = require('./Abstract');

class Answers extends Abstract {

    constructor(db) {
        super(db);

        this._collectionName = 'answers';

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

module.exports = Answers;
