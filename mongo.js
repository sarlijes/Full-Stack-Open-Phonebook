const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)


if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
} else if (process.argv.length === 5) {
    const newPerson = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    newPerson.save().then(response => {
        console.log('added ', newPerson.name, ' number ', newPerson.number, ' to phone book');
        mongoose.connection.close();
    })
} else {
    console.log("Phone book:")
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}

const password = process.argv[2]

const url =
    `mongodb+srv://user123:${password}@cluster0-prolt.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

// Yhteyden avaamisen jälkeen määritellään muistiinpanon skeema ja sitä vastaava model:
// Modelit ovat ns. konstruktorifunktioita, jotka luovat parametrien perusteella Javascript-olioita. 
// Koska oliot on luotu modelien konstruktorifunktiolla, niillä on kaikki modelien ominaisuudet, eli 
// joukko metodeja, joiden avulla olioita voidaan mm. tallettaa tietokantaan.


const person1 = new Person({
    name: 'Mingo Mungo 1',
    number: '11 1112 5'
})
const person2 = new Person({
    name: 'Twai Twai',
    number: '22 2222 5'
})
const person3 = new Person({
    name: 'Tregge Tresdottir',
    number: '3333 333'
})