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
app.get('/api/people', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

// get all
app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

// get with id
app.get('/api/persons/:id', (req, res) => {
  const id = persons.find(a => a.id === Number(req.params.id))
  if (id) {
    res.json(id)
  } else {
    res.status(404).json({
      message: 'contact not found'
    })
  }
})

// delete
app.delete('/api/persons/:id', (req, res) => {
  const findId = persons.find(a => a.id === Number(req.params.id))
  if (findId) {
    persons = persons.filter(a => a.id !== Number(req.params.id))
    res.status(200).json({
      message: 'contact deleted'
    })
  } else {
    res.status(404).json({
      message: 'contact not found'
    })
  }
});

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

app.post("/api/persons/", (req, res) => {
  const person = req.body;

  if (person.name === undefined || person.number == undefined) {
    return res.status(400).json({ error: 'name or number is missing'});
  }

  if (persons.find(person => person.name === req.body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }

  person.id = generateId()
  persons = persons.concat(person);
  res.json(person);
});

const error = (request, response) => {
  response.status(404).send({ error: '404 unknown endpoint' })
}

app.use(error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})