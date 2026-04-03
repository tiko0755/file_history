import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router()

const db = new Database("/home/workspace/f10_db/f10.db");

const read = (code, date=39991231) => {
  const stmt = db.prepare(`SELECT * FROM companysurvey 
    WHERE (code = ? AND end_date <= ?)
    ORDER BY end_date ASC;
  `);
  return stmt.all(code,date);
}

//console.dir(read('sh600123'));


// middleware that is specific to this router
const timeLog = (req, res, next) => {
  console.log('Time: ', Date.now())
  next()
}
router.use(timeLog)

// define the home page route
router.get('/', (req, res) => {
  res.send('F10 home page')
})
// define the about route
router.get('/about', (req, res) => {
  res.json(read('sh600123'))
})

export { router }


