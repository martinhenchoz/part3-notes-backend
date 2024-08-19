const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@notes.wxqxz.mongodb.net/phoneBookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

let personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Persona = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
  // Mostrar todas las personas
  Persona.find({})
    .then(result => {
      result.forEach( ({name, number}) => {
        console.log(name, number)
      })
      mongoose.connection.close()
      process.exit(0)
    })
    .catch(error => {
      console.log(error)
      process.exit(1)
    })
} else {
  // Insertar una nueva persona
  const name = process.argv[3]
  const number = process.argv[4]
  const nuevaPersona = new Persona({ name, number })
  nuevaPersona.save()
    .then( () => {
      console.log(`Added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
      process.exit(0)
    })
    .catch( error => {
      console.log(error)
      mongoose.connection.close()
      process.exit(1)
    })
}

