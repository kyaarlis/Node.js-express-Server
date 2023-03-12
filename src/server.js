const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

// pieslēdzamies mūsu DB
const database = new sqlite3.Database("./src/db/database.db");

// inicializējam express appu
const app = express()

// ļaujam piekļūt serverim no citiem domēniem
app.use(cors({
  origin: '*'
}))

// ļaujam no FE sūtīt jsonu
app.use(bodyParser.json());

// uz servera palaišanu
database.serialize(() => {
  // create the projects table if it doesn't exist
  database.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      project_name VARCHAR(255) NOT NULL,
      task VARCHAR(255) NOT NULL,
      start_date DATE,
      status ,
      due_date DATE
    );
  `);


  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);

  // if there are no projects in the database yet, add the first one
  database.get('SELECT * FROM users', (err, user) => {
    if (!user) {
      database.run(`
        INSERT INTO users (username, password)
        VALUES('dzeks123', 'kakina8363');
      `);
    }
  });
});


// Atgriež visus projektus no DB
app.get('/projects', (req, res) => {
    // database.get atgriež tikai vienu pirmo atrasto rezutlātu
      // database.all atgriež visus atrastos rezultātus
  database.all('SELECT * FROM projects', (error, project) => {
    res.json(project)
  })
})

// POST http://localhost:3000/projects
// pievieno jaunu projektu
app.post('/projects', (req, res) => {
  database.run(`
    INSERT INTO projects (project_name, task, start_date, due_date)
    VALUES("${req.body.projectName}", "${req.body.task}", "${req.body.start_date}", "${req.body.dueDate}");
  `, () => {
    res.json('Jauns projekts pievienots veiksmīgi')
  })
})

app.put('/projects/:id', (req, res) => {
  database.run(`
  UPDATE projects SET project_name = "${req.body.projectName}", task = "${req.body.task}", start_date = "${req.body.start_date}", due_date = "${req.body.dueDate}" 
  WHERE id=${req.params.id};
  `, () => {
    res.json('Jauns projekts pievienots veiksmīgi')
  })
})

app.delete('/projects/:id', (req, res) => {
  database.run(`DELETE FROM projects WHERE id=${req.params.id}`,
  () => {
    res.json('Projekts dzests!')
  })
}) 

// users
app.get('/users', (req, res) => {
  // database.get atgriež tikai vienu pirmo atrasto rezutlātu
    // database.all atgriež visus atrastos rezultātus
database.all('SELECT * FROM users', (error, user) => {
  res.json(user)
})
})

app.post('/users', (req, res) => {
  database.run(`
    INSERT INTO users (username, password)
    VALUES("${req.body.username}", "${req.body.password}");
  `, () => {
    res.json('Jauns lietotājs pievienots veiksmīgi')
  })
})

// palaižam serveri ar 3004 portu
app.listen(3004, () => {
  console.log(`Example app listening on port 3004`)
})

