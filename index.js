const express = require('express');

const app = express();
const port = 3000;

// const db = require('./connection/database');
app.set('view engine', 'hbs');

const dataBlog = [];
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.urlencoded({ extended: false }));

let isLogin = true;

app.get('/', (req, res) => {
  console.log(dataBlog);

  // db.connect((err,client,done) => {
  //   if (err) throw err

  //   client.query('SELECT * FROM tb_projects', (err, result) => {
  //     if (err) throw err
  //     let data = result.row
  //     res.render('index', { isLogin, blogs: data });
  //   })

  // })

  let data = dataBlog.map((item) => {
    return {
      ...item,
      author: 'saya',
    };
  });
  console.log(data);
  res.render('index', { isLogin, blogs: data });
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/project', (req, res) => {
  res.render('project');
});

app.post('/project', (req, res) => {
  let data = req.body;
  data = {
    projectName: data.project_name,
    startDate: data.start_date,
    endDate: data.end_date,
    desc: data.desc,
    image: data.image,
    isLogin,
  };
  console.log(data);
  dataBlog.push(data);
  res.redirect('/');
});

app.get('/delete-blog/:index', (req, res) => {
  // console.log(req.params.index);
  let index = req.params.index;
  console.log(index);
  dataBlog.splice(index, 1);
  res.redirect('/');
});

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
