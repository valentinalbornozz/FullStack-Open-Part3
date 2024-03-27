const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const PORT = 3001;

// Middleware para permitir solicitudes CORS
app.use(cors());

// Middleware para parsear el body de la solicitud como JSON
app.use(express.json());

// Configurar el middleware morgan para registrar mensajes en la consola con la configuración 'tiny'
// Y también mostrar los datos enviados en las solicitudes POST
morgan.token("postData", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

// Datos de la agenda telefónica
let persons = [
  { id: 1, name: "Arto Hellas", number: "040-123456" },
  { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
  { id: 3, name: "Dan Abramov", number: "12-43-234345" },
  { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" },
];

// Función para generar un ID aleatorio único
const generateId = () => {
  return Math.floor(Math.random() * 10000);
};

// Middleware para manejar errores en la creación de nuevas entradas
const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const requestTime = new Date();
  const numEntries = persons.length;

  res.send(`
    <div>
      <p>Phonebook has info for ${numEntries} people</p>
      <p>${requestTime}</p>
    </div>
  `);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);

  if (!person) {
    return res.status(404).json({ error: "Person not found" });
  }

  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  // Verificar si el nombre ya existe en la agenda
  const existingPerson = persons.find((p) => p.name === body.name);
  if (existingPerson) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const newPerson = {
    id: generateId(), // Generar un ID aleatorio
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  res.status(201).json(newPerson);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
