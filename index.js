const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

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

app.use(bodyParser.json())

// create morgan middleware
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
  res.json(persons)
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

// post (create new contact)
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (persons.find(a => a.name === body.name)) {
    return res.status(409).json({
      error: 'name must be unique'
    })
  }
  else if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  return res.status(201).json({
    message: 'lisäys suoritettu'
  })
})

const error = (request, response) => {
  response.status(404).send({ error: '404 unknown endpoint' })
}

app.use(error)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})