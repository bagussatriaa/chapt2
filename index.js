const { query } = require('express');
const express = require('express');

const app = express();
const port = 300;
const db = require('./connection/database');
app.set('view engine', 'hbs');

const dataBlog = [];
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.urlencoded({ extended: false }));

const isLogin = true;

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

          isLogin,
        };
      });
      // console.log(dataBlog);
      res.render('index', { isLogin, blogs: dataBlog });
    });
  });

  app.get('/register', (req, res) => {
    res.render('register');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.get('/contact', (req, res) => {
    res.render('contact');
  });

  app.get('/project', (req, res) => {
    res.render('project');
  });

  app.post('/project', (req, res) => {
    // data = {
    //   projectName: data.project_name,
    //   startDate: data.start_date,
    //   endDate: data.end_date,
    //   duration: takeTheTime(data.start_date, data.end_date),
    //   desc: data.desc,
    //   image: data.image,
    //   icons,
    //   isLogin,
    // };
    // console.log(data);
    let data = req.body;

    // "${data.icons.java}","${data.icons.bootstrap}"
    let icons = {
      vuejs: req.body.vuejs,
      js: req.body.js,
      java: req.body.java,
      bootstrap: req.body.bootstrap,
    };
    let query = `INSERT INTO tb_projects(
      "projectName", "desc" , start_date, end_date, icons)
        VALUES ('${data.project_name}', '${data.desc}', '${data.start_date}', '${data.end_date}', 
        '{"${icons.vuejs}","${icons.js}","${icons.java}","${icons.bootstrap}"}')`;
    client.query(query, (err, result) => {
      if (err) throw err;

      res.redirect('/');
    });
  });

  app.get('/blog-detail/:id', (req, res) => {
    let id = req.params.id;
    console.log(id);
    let query = 'SELECT * FROM tb_projects';
    client.query(query, (err, result) => {
      if (err) throw err;
      // let icons = {
      //   vuejs: .vuejs,
      //   js: req.body.js,
      //   java: req.body.java,
      //   bootstrap: req.body.bootstrap,
      // };
      // detaildata = dataBlog[id];
      // console.log(result.rows[0]);
      let detaildata = result.rows[0];
      console.log(detaildata);
      // let icons = {
      //   vuejs: detaildata.icons[0],
      //   js: detaildata.icons[1],
      //   java: detaildata.icons[2],
      //   bootstrap: detaildata.icons[3],
      // };
      // console.log(icons);
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
      };
      // console.log(detaildata);
      res.render('blog-detail', { id, isLogin, detaildata });
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
      res.render('edit-blog', { id, update: dataBlog });
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
      SET "projectName"='${dataUpdate.project_name}', "desc"='${dataUpdate.desc}',  start_date='${dataUpdate.start_date}', end_date='${dataUpdate.end_date}', icons= '{"${iconsUpdate.vuejs}","${iconsUpdate.js}","${iconsUpdate.java}","${iconsUpdate.bootstrap}"}'
        
      WHERE id = ${id};`;
    client.query(query, (err, result) => {
      if (err) throw err;
    });
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
