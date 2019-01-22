const express = require('express');
const router = express.Router();
const connection = require('../model/mysqlConnection');

router.get('/', function(req, res, next) {
  if (req.session.user_id) {
    console.log(req.session.user_id);
    res.redirect('/editor');
  } else {
    res.render('login', {
      title: 'ログイン'
    });
  }
});

router.post('/', function(req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  let query = 'SELECT user_id FROM users WHERE email = "' + email + '" AND password = "' + password + '" LIMIT 1';
  //emailとpasswordが一致しているユーザーを一件だけ返す
  connection.query(query, function(err, rows) {
    console.log(rows);
    //ユーザーのデータが返ってきた場合のみuser_idを代入する
    let userId = rows.length? rows[0].user_id: false;
    if (userId) {
      req.session.user_id = userId;//セッションにユーザーIDを保存
      res.redirect('/editor');
    } else {
      res.render('login', {
        title: 'ログイン',
        noUser: 'メールアドレスとパスワードが一致するユーザーはいません'
      });
    }
  });
});

module.exports = router;
