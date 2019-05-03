const mongoose = require('mongoose')
const paramCount = process.argv.length;
console.log('params #', paramCount)

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-itz0t.mongodb.net/person?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

/******* Saving ********/
if (paramCount === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(response => {
    console.log('person saved!');
    mongoose.connection.close();
  })
}


/******* Fetching ********/
if (paramCount === 3) {
  console.log('Puhelinluettelo:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}
