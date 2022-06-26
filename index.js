const express = require('express');

const app = express();
const port = 3000;

app.set('view engine', 'hbs');

const dataBlog = [];
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.urlencoded({ extended: false }));

let isLogin = true;

app.get('/', (req, res) => {
  let data = dataBlog.map((item) => {
    return {
      ...item,
      author: 'saya',
    };
  });
  // console.log(data);
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

  let icons = {
    vuejs: req.body.vuejs,
    js: req.body.js,
    java: req.body.java,
    bootstrap: req.body.bootstrap,
  };

  data = {
    projectName: data.project_name,
    startDate: data.start_date,
    endDate: data.end_date,
    duration: takeTheTime(data.start_date, data.end_date),
    desc: data.desc,
    image: data.image,
    icons,
    isLogin,
  };
  // console.log(data);

  dataBlog.push(data);
  // console.log(formatDate);
  res.redirect('/');
});

app.get('/blog-detail/:index', (req, res) => {
  let index = req.params.index;
  console.log(index);
  detaildata = dataBlog[index];

  console.log(detaildata);
  res.render('blog-detail', { index, isLogin, detaildata });
});

app.get('/delete-blog/:index', (req, res) => {
  // console.log(req.params.index);
  let index = req.params.index;
  // console.log(index);
  dataBlog.splice(index, 1);
  res.redirect('/');
});

app.get('/edit-blog/:index', (req, res) => {
  let index = req.params.index;
  console.log(index);
  let update = dataBlog[index];
  console.log(update);
  res.render('edit-blog', { index, update, dataBlog });
});

app.post('/edit-blog/:index', (req, res) => {
  let index = req.params.index;
  console.log(index);
  // console.log(dataBlog);
  let dataUpdate = req.body;
  dataUpdate = {
    projectName: dataUpdate.project_name,
    startDate: dataUpdate.start_date,
    endDate: dataUpdate.end_date,
    duration: takeTheTime(dataUpdate.start_date, dataUpdate.end_date),
    desc: dataUpdate.desc,
    image: dataUpdate.image,
    isLogin,
  };
  dataBlog[index] = {
    ...dataBlog[index],
    ...dataUpdate,
  };
  // console.log(dataUpdate);
  res.redirect('/');
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
