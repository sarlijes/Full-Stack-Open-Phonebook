require('dotenv').config()

const morgan = require('morgan')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')
const createError = require('http-errors')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :reqBody :status :res[content-length] - :response-time ms'))
morgan.token('reqBody', (req) => JSON.stringify(req.body))
app.use(cors())


let persons = []

app.get('/', (req, response) => {
    response.send('<h1>Phone Book</h1>')
})

app.get('/info', (req, res) => {
    Person.find({}).then(personList => {
        res.set({
            'Content-Type': 'text/plain;characterEncoding=UTF-8'
        })
        res.end('Phone book has contact info for ' + personList.length + ' people'
            + '\n' + new Date())
    })
})

// Pyyntöön vastataan response-olion metodilla json, joka lähettää HTTP-pyynnön 
// vastaukseksi parametrina olevaa Javascript-olioa eli taulukkoa persons vastaavan 
// JSON-muotoisen merkkijonon. Express asettaa headerin Content-type arvoksi 
// application/json.

// Palautetaan HTTP-pyynnön vastauksena toJSON-metodin avulla siistittyjä oliota:

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    });
});

// Näyttää yksittäisen henkilön, jos se löytyy, muussa tapauksessa 404 eli not found

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// poistaa tietyn tai vastaa 204 no content

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    Person.find({})
        .then(personList => {
            const foundPerson = personList.find(p => p.name === body.name)
            // jos annetun nimistä henkilöä ei ole olemassa, luo uusi
            if (!foundPerson) {
                const person = new Person({
                    name: body.name,
                    number: body.number
                })
                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson.toJSON())
                        console.log('onnistuneesti luotu uusi person', savedPerson)
                    })
                    .catch(error => next(error))
            }
            // jos henkilö löytyi, tallennusoperaatio poikkeuksen ja välittää sen errorhandlerille:
            else {
                const person = new Person({ name: body.name, number: body.number, })
                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson.toJSON())
                    })
                    .catch(error => next(error))
            }
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
        .catch(error => next(createError.BadRequest('person with name already exists')))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    // console.log('------------------error-----------')
    // console.error(error.message)
    // console.log(error.errors.name.kind, "error.errors.name.kind")
    // console.log('------------------error-----------')
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'Error: Malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'Error: Name must be unique' })
    }
    next(error)
}

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})