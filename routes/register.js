const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require('../model/mysqlConnection');

router.get('/', function(req, res, next){
  res.render('register', {
    title: '新規ユーザー登録'
  });
});

router.post('/', function(req, res, next){
  let userName = req.body.user_name;
  let email = req.body.email;
  let password = req.body.password;
  let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  let emailExitsQuery = 'SELECT * FROM users WHERE email = "' + email + '" LIMIT 1';//emailがあれば取得
  let registerQuery = 'INSERT INTO users (user_name, email, password, created_at) VALUES ("' 
                      + userName + '", ' + '"' + email + '", ' + '"' + password + '", ' + '"' + createdAt + '")';//ユーザー情報
  connection.query(emailExitsQuery, function(err, email) {
    //console.log(email);
    let emailExits = email.length;
    if(emailExits){
      res.render('register', {
        title: '新規ユーザー登録',
        emailExits: '既に登録されているメールアドレスです'
      });
    }else{
      //同じメールアドレスが存在しない場合
      connection.query(registerQuery, function(err, rows){
        //console.log(rows);
        res.redirect('/login');
      });
    }
  });
});

module.exports = router;
