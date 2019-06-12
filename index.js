const express = require('express')
const app = express()

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
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 3
    }
]


app.get('/', (req, res) => {
    res.send('<h1>Phone Book</h1>')
})

app.get('/info', (req, res) => {
    res
    .set({
        'Content-Type': 'text/plain;characterEncoding=UTF-8'
    })
    .end('Phone book has contact info for ' + persons.length + ' people'
        + '\n request made on ' + new Date())
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})