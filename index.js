require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456",
  },
  {
    "id": 2,
    "name": "Martti Tienari",
    "number": "040-123456",
  },
  {
    "id": 3,
    "name": "Arto Järvinen",
    "number": "040-123456",
  },
  {
    "id": 4,
    "name": "Lea Kutvonen",
    "number": "040-123456",
  }
]

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())

app.use(morgan('tiny'))
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res), "status:",
    tokens.status(req, res), "length:",
    tokens.res(req, res, 'content-length'), 'response time:',
    tokens['response-time'](req, res), 'ms',
    (tokens.method(req, res) === "POST") ? JSON.stringify(req.body) : ''
  ].join(' ')
}))

// info
app.get('/info', (req, res) => {
  const date = new Date();
  res.send(`
    <h1>Puhelinluettelo</h1>
    <p>Puhelinluettelossa ${persons.length} henkilön tiedot</p>
    <p>${date}</p>
    `)
})

// get all
app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

// get with id
app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end() 
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
      // .catch(error => next(error))
    })
})

// delete
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(person => {
      if(person) {
        res.status(200).send({ ok: `user < ${person.name} > deleted` })
      } 
      else {
      res.status(204).end()
      }
    })
    .catch(error => next(error))
})

// generate ID
const generateId = () => {
  let maxId;
  let findId = true
  while (findId) {
    maxId = Math.floor(Math.random() * 500) + 50;
    let inPersons = persons.find(a => a.id === maxId)
    if (!inPersons) {
      findId = false
      return maxId
    }
  }
}

// add person  !!!!! generate id
app.post("/api/persons/", (req, res) => {
  const person = req.body;

  if (person.name === undefined || person.number == undefined) {
    return res.status(400).json({ error: 'name or number is missing' });
  }

  if (persons.find(person => person.name === req.body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number
  });

  newPerson.save().then(savedPerson => {
    res.json(savedPerson.toJSON());
  });
});

const error = (request, response) => {
  response.status(404).send({ error: '404 unknown endpoint' })
}

app.use(error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})