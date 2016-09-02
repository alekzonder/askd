# askd

[![Code Climate](https://codeclimate.com/github/alekzonder/askd/badges/gpa.svg)](https://codeclimate.com/github/alekzonder/askd)
[![Test Coverage](https://codeclimate.com/github/alekzonder/askd/badges/coverage.svg)](https://codeclimate.com/github/alekzonder/askd/coverage)
[![Build Status](https://travis-ci.org/alekzonder/askd.svg?branch=master)](https://travis-ci.org/alekzonder/askd)

questions, answers, decisions, discussions service

# architecture

## questions

### entity
```
{
    id: '',
    title: '',
    text: '',
    userId: '',
    creationDate: '',
    modificationDate: ''
}
```

### POST /questions

### GET /questions/:id

### GET /questions

### PATCH /questions/:id

### DELETE /questions/:id


## answers

### entity

```
{
    id: '',
    questionId: '',
    userId: '',
    text: '',
    creationDate: '',
    modificationDate: ''
}
```

### POST /answers

### GET /answers

### GET /answers/:id

### PATCH /answers/:id

### DELETE /answers/:id

# License

MIT
