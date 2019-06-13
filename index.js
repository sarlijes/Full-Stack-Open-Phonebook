const morgan = require('morgan')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :reqBody :status :res[content-length] - :response-time ms'))
morgan.token('reqBody', (req) => JSON.stringify(req.body))

let persons = [
    {
        "name": "Sven Mislintat",
        "number": "040-123456",
        "id": 0
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 1
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 2
    }
]


// Tapahtumankäsittelijäfunktiolla on kaksi parametria. Näistä ensimmäinen eli 
// request sisältää kaikki HTTP-pyynnön tiedot ja toisen parametrin response:n 
// avulla määritellään, miten pyyntöön vastataan.

app.get('/', (req, response) => {
    response.send('<h1>Phone Book</h1>')
})
// vastataan pyyntöön 1. Content-Type-headerille arvo text/plain ja asettamalla 
// palautettavan sivun sisällöksi haluttu merkkijono.

app.get('/info', (req, response) => {
    response
        .set({
            'Content-Type': 'text/plain;characterEncoding=UTF-8'
        })
        .end('Phone book has contact info for ' + persons.length + ' people'
            + '\n request made on ' + new Date())
})

// Pyyntöön vastataan response-olion metodilla json, joka lähettää HTTP-pyynnön 
// vastaukseksi parametrina olevaa Javascript-olioa eli taulukkoa persons vastaavan 
// JSON-muotoisen merkkijonon. Express asettaa headerin Content-type arvoksi 
// application/json.

app.get('/api/persons', (req, response) => {
    response.json(persons)
})

// Näyttää yksittäisen henkilön, jos se löytyy, muussa tapauksessa 404 eli not found

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

// poistaa tietyn, vastaa 204 no content

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    let newId = Math.floor(Math.random() * 1000) + persons.length;
    return newId
}

// body-parser ottaa pyynnön mukana olevan JSON-muotoisen datan, muuttaa sen 
// js-olioksi ja sijoittaa request-olion kenttään body ennen kuin routen 
// käsittelijää kutsutaan.

app.post('/api/persons', (request, response) => {
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
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    // Pyyntöön vastataan response-olion metodilla json, joka lähettää HTTP-pyynnön 
    // vastaukseksi parametrina olevaa Javascript-olioa eli taulukkoa persons vastaavan 
    // JSON-muotoisen merkkijonon.

    persons = persons.concat(person)
    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
