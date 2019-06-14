require('dotenv').config()

const morgan = require('morgan')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :reqBody :status :res[content-length] - :response-time ms'))
morgan.token('reqBody', (req) => JSON.stringify(req.body))
app.use(cors())

let persons = []

// Tapahtumankäsittelijäfunktiolla on kaksi parametria. Näistä ensimmäinen eli 
// request sisältää kaikki HTTP-pyynnön tiedot ja toisen parametrin response:n 
// avulla määritellään, miten pyyntöön vastataan.

app.get('/', (req, response) => {
    response.send('<h1>Phone Book</h1>')
})

// vastataan pyyntöön 1. Content-Type-headerille arvo text/plain ja asettamalla 
// palautettavan sivun sisällöksi haluttu merkkijono.

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

// Vanha versio:
// app.get('/api/persons', (req, response) => {
//     response.json(persons)
// })

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
// poistaa tietyn, vastaa 204 no content

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// body-parser ottaa pyynnön mukana olevan JSON-muotoisen datan, muuttaa sen 
// js-olioksi ja sijoittaa request-olion kenttään body ennen kuin routen 
// käsittelijää kutsutaan.

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
    // const lista = Person.find( { name: body.name })
    // console.log(lista)

    Person.find({}).then(personList => {
        //    console.log(personList)
        const foundPerson = personList.find(p => p.name === body.name)

        console.log('person-------', foundPerson)

        if (!foundPerson) {
            const person = new Person({
                name: body.name,
                number: body.number
            })
            person.save().then(savedPerson => {
                response.json(savedPerson.toJSON())
            })
        } else {
            const person = {
                name: body.name,
                number: body.number,
            }
            Person.findByIdAndUpdate(foundPerson.id, person, { new: true })
                .then(updatedPerson => {
                    response.json(updatedPerson.toJSON())
                })
                .catch(error => next(error))
        }
    })

    // Person.find( { name: body.name }).then(result => {
    //     console.log('-------------------------')
    //     console.log('name', name)
    //     console.log('löytyi sama')

    //     console.log('Person.id', Person.id)
    //     console.log('Person.name', Person.name)
    //     console.log('body.name', body.name)
    //     console.log('result', result)

    //     Person.findByIdAndUpdate(request.params.id, person, { new: true })
    //         .then(updatedPerson => {
    //             response.json(updatedPerson.toJSON())
    //         })
    //         .catch(error => next(error))


    // })

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
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)
}

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})