const express = require('express');
const router = express.Router();
const fs = require('fs');
const execSync = require('child_process').execSync;

router.get('/', (req, res, next) => {
  res.render('editor', {title: 'Latex Editor'});
});

router.post('/', (req, res, next) => {
  jsonData = JSON.stringify(req.body.msg).slice(1, -1);
  //jsonを受け取り、文頭・文末の「"」を削除する
  var arr = jsonData.split(/\\n/);
  //var arr = jsonData.split(/(?!\\\\newpage)(?=\\n)/);
  // \newpageの処理は保留
  for (var i = 0; i < arr.length; i++){
    arr[i] = arr[i].replace(/\\\\/g, '\\');
    fs.appendFileSync('sample.tex', arr[i] + '\n', function (err) {
      console.log(err);
    });
  }
  // ディレクトリの作成 ＊今後使用する予定
  if (!fs.existsSync('./texFile')) {
    fs.mkdirSync('./texFile');
  }

  //コンパイルの実行
  //if(!fs.statSync('./sample.tex')){
  execSync('platex sample.tex');
  execSync('platex sample.tex');
  execSync('dvipdfmx sample');
  execSync('open sample.pdf');
  //}

  res.send(jsonData);
});

module.exports = router;
