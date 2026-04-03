import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router()
const db = new Database("/home/workspace/f10_db/f10.db");

// 查询指定 code, 在 date 时的公司介绍 
const select_all_by_code_date = (code, date=39991231) => {
  const stmt = db.prepare(`SELECT * FROM companysurvey 
    WHERE (code = ? AND end_date <= ?)
    ORDER BY end_date DESC
    LIMIT 1;
  `);
  return stmt.all(code,date);
}

const select_code_enddate_by_zqlb = (keyword) => {
  const stmt = db.prepare(`SELECT code, end_date FROM companysurvey 
    WHERE (zqlb LIKE '%${keyword}%');
  `);
  return stmt.all();
}
//console.dir(select_code_enddate_by_zqlb("风险"));

const select_majors = () => {
  const stmt = db.prepare(`SELECT DISTINCT sszjhhy FROM companysurvey;`);
  return stmt.all();
}
// console.dir(select_majors());

const select_codes_by_hy = (keyword) => {
  const stmt = db.prepare(`SELECT DISTINCT code FROM companysurvey
    WHERE (sszjhhy LIKE '%${keyword}%');
  `);
  return stmt.all();
}
// console.dir(select_codes_by_hy("制造业-农副食品加工业"));

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
  res.json(read_info('sh600123'))
})

router.get('/select_all_by_code_date', (req, res) => {
  res.json(select_all_by_code_date(req.query.code, req.query?.date||29991231))
})

router.get('/select_code_enddate_by_zqlb', (req, res) => {
  res.json(select_code_enddate_by_zqlb(req.query.keyword))
})

export { router }


