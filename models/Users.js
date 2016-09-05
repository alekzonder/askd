'use strict';

var Abstract = require('./Abstract');

class Users extends Abstract {

    constructor(db) {
        super(db);

        this._collectionName = 'users';

        this._indexes = [
            {
                fields: {
                    email: 1
                },
                options: {
                    name: 'email',
                    unique: true,
                    background: true
                }
            }
        ];
    }

}

module.exports = Users;
