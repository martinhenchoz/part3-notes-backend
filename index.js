require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

const Person = require('./models/person')

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Nueva persona
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).send({ error: 'Name missing' })
  } 
  
  if (body.number === undefined) {
    return response.status(400).send({ error: 'Number missing' })
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
  
})

app.get('/', (request, response) => {
  response.send('<h1>Persons API</h1>')
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const hora = new Date(Date.now()).toString()
    const cant = persons.length
    const html = `
    <p>Phonebook has info for ${cant} people</p>
    <p>${hora}</p>
    `
    response.send(html)
  })
})

// Obtener todas las personas
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})  

// Obtener una persona
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
  .then( person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch( error => next(error) )
})

// Modificar una persona
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const id = request.params.id

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// Borrar una persona 
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint) 

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  } 
  next(error)
}

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
