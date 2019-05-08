require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

let persons = [
  {
    'id': 1,
    'name': 'Arto Hellas',
    'number': '040-123456',
  },
  {
    'id': 2,
    'name': 'Martti Tienari',
    'number': '040-123456',
  },
  {
    'id': 3,
    'name': 'Arto Järvinen',
    'number': '040-123456',
  },
  {
    'id': 4,
    'name': 'Lea Kutvonen',
    'number': '040-123456',
  }
]

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())

app.use(morgan('tiny'))
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res), 'status:',
    tokens.status(req, res), 'length:',
    tokens.res(req, res, 'content-length'), 'response time:',
    tokens['response-time'](req, res), 'ms',
    (tokens.method(req, res) === 'POST') ? JSON.stringify(req.body) : ''
  ].join(' ')
}))

// info
app.get('/info', (req, res) => {
  const date = new Date()

  Person.find({}).then(people => {
    res.send(`
    <h1>Puhelinluettelo</h1>
    <p>Puhelinluettelossa ${people.reduce(sum => {
      return sum + 1;
    }, 0)} henkilön tiedot</p>
    <p>${date}</p>
    `)
  })
})

// get all
app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

// get with id
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(note => {
      if (note) {
        res.json(note.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// delete
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(person => {
      if (person) {
        res.status(200).send({ ok: `user < ${person.name} > deleted` })
      }
      else {
        res.status(204).end()
      }
    })
    .catch(error => next(error))
})

// add person
app.post('/api/persons/', (req, res, next) => {
  const person = req.body

  if (person.name === undefined) {
    return res.status(400).json({ error: 'name is missing' })
  }

  if (person.number === undefined) {
    return res.status(400).json({ error: 'number is missing' })
  }

  if (persons.find(person => person.name === req.body.name)) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson
    .save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    }).catch(error => next(error))
})

// change phone number
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    number: body.number
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})