const express = require('express');

const app = express();
const db = require('./connection/database');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const upload = require('./middlewares/fileUpload');

const port = 300;

app.set('view engine', 'hbs');
app.use(
  session({
    secret: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
  })
);
const dataBlog = [];

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());

db.connect((err, client, done) => {
  if (err) throw err;

  app.get('/', (req, res) => {
    let query = 'SELECT * FROM tb_projects';
    client.query(query, (err, result) => {
      if (err) throw err;
      let data = result.rows;
      // console.log(result);
      // console.log(result.rows);

      let dataBlog = data.map((item) => {
        // console.log(item);
        return {
          ...item,
          duration: takeTheTime(item.start_date, item.end_date),
          isLogin: req.session.isLogin,
        };
      });
      // console.log(dataBlog);
      res.render('index', { blogs: dataBlog, user: req.session.user, isLogin: req.session.isLogin });
    });
  });

  app.get('/contact', (req, res) => {
    res.render('contact', { user: req.session.user, isLogin: req.session.isLogin });
  });

  app.get('/project', (req, res) => {
    res.render('project', { user: req.session.user, isLogin: req.session.isLogin });
  });

  app.post('/project', upload.single('image'), (req, res) => {
    let data = req.body;

    const image = req.file.filename;
    // console.log(image);
    let icons = {
      vuejs: req.body.vuejs,
      js: req.body.js,
      java: req.body.java,
      bootstrap: req.body.bootstrap,
    };
    let query = `INSERT INTO tb_projects(
      "projectName", "desc" , start_date, end_date, icons, image)
        VALUES ('${data.project_name}', '${data.desc}', '${data.start_date}', '${data.end_date}', 
        '{"${icons.vuejs}","${icons.js}","${icons.java}","${icons.bootstrap}"}','${image}')`;
    client.query(query, (err, result) => {
      if (err) throw err;

      res.redirect('/');
    });
  });

  app.get('/blog-detail/:id', upload.single('image'), (req, res) => {
    let id = req.params.id;
    console.log(id);
    let query = `SELECT * FROM tb_projects WHERE id=${id}`;
    client.query(query, (err, result) => {
      if (err) throw err;

      let detaildata = result.rows[0];
      // console.log(detaildata);
      detaildata = {
        projectName: detaildata.projectName,
        start_date: detaildata.start_date,
        end_date: detaildata.end_date,
        duration: takeTheTime(detaildata.start_date, detaildata.end_date),
        desc: detaildata.desc,
        icons: {
          vuejs: detaildata.icons[0],
          js: detaildata.icons[1],
          java: detaildata.icons[2],
          bootstrap: detaildata.icons[3],
        },
        image: detaildata.image,
      };
      console.log(detaildata.image);
      res.render('blog-detail', { id, detaildata, user: req.session.user, isLogin: req.session.isLogin });
    });
  });

  app.get('/delete-blog/:id', (req, res) => {
    let id = req.params.id;
    let query = `DELETE FROM tb_projects WHERE id= ${id}`;

    client.query(query, (err, result) => {
      if (err) throw err;
      res.redirect('/');
    });
  });

  app.get('/edit-blog/:id', (req, res) => {
    let id = req.params.id;
    console.log(id);
    let query = `SELECT * FROM tb_projects WHERE id = ${id}`;
    client.query(query, (err, result) => {
      if (err) throw err;
      let dataBlog = result.rows[0];
      console.log(dataBlog);
      // let update = dataBlog[id];
      // console.log(update);
      res.render('edit-blog', { id, update: dataBlog, user: req.session.user, isLogin: req.session.isLogin });
    });
    // console.log(update);
  });

  app.post('/edit-blog/:id', (req, res) => {
    let id = req.params.id;
    // console.log(id);
    let dataUpdate = req.body;
    let iconsUpdate = {
      vuejs: req.body.vuejs,
      js: req.body.js,
      java: req.body.java,
      bootstrap: req.body.bootstrap,
    };
    console.log(dataUpdate);
    let query = `UPDATE tb_projects
      SET "projectName"='${dataUpdate.project_name}', "desc"='${dataUpdate.desc}',  start_date='${dataUpdate.start_date}', end_date='${dataUpdate.end_date}', icons= '{"${iconsUpdate.vuejs}","${iconsUpdate.js}","${iconsUpdate.java}","${iconsUpdate.bootstrap}"}, '
      WHERE id = ${id};`;
    // image='${dataUpdate.image}',
    client.query(query, (err, result) => {
      if (err) throw err;
    });
    res.redirect('/');
  });

  app.get('/register', (req, res) => {
    res.render('register', { user: req.session.user, isLogin: req.session.isLogin });
  });

  app.post('/register', (req, res) => {
    let { regName, regEmail, regPw } = req.body;
    console.log(regPw);
    const hashPw = bcrypt.hashSync(regPw, 10);

    const query = `INSERT INTO tb_user(name, email, password)
    VALUES ('${regName}', '${regEmail}', ' ${hashPw}');`;
    client.query(query, (err, result) => {
      if (err) throw err;

      res.redirect('/login');
    });
  });

  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.post('/login', (req, res) => {
    let { regEmail, regPw } = req.body;
    console.log(regPw);

    client.query(`SELECT * FROM tb_user WHERE email='${regEmail}'`, (err, result) => {
      if (err) throw err;

      console.log(result.rows[0]);
      if (result.rows.length == 0) {
        req.flash('notRegis', 'Unregister');
        return res.redirect('/register');
      }
      const isMatch = bcrypt.compareSync(regPw, result.rows[0].password);
      console.log(isMatch);
      console.log(result.rows[0].password);

      if (isMatch !== true) {
        req.session.isLogin = true;
        req.session.user = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
        };
        req.flash('success', 'Login success');
        res.redirect('/');
      } else {
        req.flash('danger', 'wrong password');
        res.redirect('/login');
      }
    });
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();

    res.redirect('/');
  });
});
// duration function
function takeTheTime(start, end) {
  let result;
  let one = new Date(start);
  let two = new Date(end);

  if (one < two) {
    result = two - one;
  } else {
    one - two;
  }

  const msecond = 1000;
  const secInHours = 3600;
  const hoursInDay = 24;
  const dayInMonth = 30;
  const monthInYears = 12;

  let distanceInDays = Math.floor(result / (msecond * secInHours * hoursInDay));
  let distanceInMonth = Math.floor(result / (msecond * secInHours * hoursInDay * dayInMonth));
  let distanceInYears = Math.floor(result / (msecond * secInHours * hoursInDay * dayInMonth * monthInYears));
  if (distanceInDays == 1) {
    return `${distanceInDays} Day`;
  } else if (distanceInYears == 1) {
    return `${distanceInYears} Year`;
  } else if (distanceInYears > 1) {
    return `${distanceInYears} Years`;
  } else if (distanceInDays >= 30) {
    return `${distanceInMonth} Month `;
  } else if (distanceInDays > 1) {
    return `${distanceInDays} Days`;
  }
}

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
