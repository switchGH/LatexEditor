const express = require('express');
const router = express.Router();
const fs = require('fs');
const execSync = require('child_process').execSync;

router.get('/', (req, res, next) => {
  res.render('editor', {title: 'Latex Editor'});
});

router.post('/', (req, res, next) => {
  let filename = 'sample';
  let dirname = 'sampleDir';

  jsonData = JSON.stringify(req.body.msg).slice(1, -1);
  //jsonを受け取り、文頭・文末の「"」を削除する
  var arr = jsonData.split(/\\n/);
  //var arr = jsonData.split(/(?!\\\\newpage)(?=\\n)/);
  // \newpageの処理は保留
  for (var i = 0; i < arr.length; i++){
    arr[i] = arr[i].replace(/\\\\/g, '\\');
    fs.appendFileSync(filename + '.tex', arr[i] + '\n', function (err) {
      console.log(err);
    });
  }

  // ディレクトリの存在を確認 ＊今後使用する予定
  try {
    fs.statSync(dirname);
    console.log('ディレクトリは存在します。');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('ディレクトリは存在しません。');
      fs.mkdirSync(dirname);// ディレクトリ作成
      console.log(dirname + 'を作成しました。');
    } else {
      console.log(error);
    }
  }

  //texファイルの存在を確認
  try {
    fs.statSync(filename + '.tex');
    console.log('texは存在します。');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('texファイルは存在しません。');
    } else {
      console.log(error);
    }
  }

  //platexコンパイルの実行
  try {
    console.log('texファイルをコンパイルします。');
    execSync('platex ' + filename + '.tex -output-directory=' + dirname).toString();
    execSync('platex ' + filename + '.tex -output-directory=' + dirname).toString();
    console.log('生成したファイルを' + dirname + '移動します');
    execSync('mv ' + filename + '.* ./' + dirname);
  } catch (error) {
    console.log(error);
  }

  //dviodfmxファイルのコンパイル
  try {
    let filePath = dirname + '/' + filename;
    let dviPath = filePath + '.dvi';
    let pdfPath = filePath + '.pdf';
    fs.statSync(dviPath);
    console.log('dviファイルは存在します。');
    execSync('dvipdfmx -o' + pdfPath + ' ' + dviPath).toString();//dviファイル作成
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('dviファイルは存在しません。');
    } else {
      console.log(error);
    }
  }
  res.send(jsonData);
});

module.exports = router;
