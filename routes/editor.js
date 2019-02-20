const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require('../model/mysqlConnection');
const fs = require('fs');
const execSync = require('child_process').execSync;

router.get('/:user_id/:workspace_id', function(req, res, next){
  let workspaceId = req.params.workspace_id;
  let userId = req.session.user_id;
  let getUWorkspacesQuery = 'SELECT * FROM workspaces WHERE workspace_id = ' + workspaceId;

  if(userId == req.params.user_id){
    connection.query(getUWorkspacesQuery, function(err, workspaces){
      res.render('editor', {
        title: 'Latex Editor',
        workspace: workspaces[0],
        // workspaceId: workspaceId
      });
    });
  }else{
    res.redirect('/logout');
  }
});

router.post('/:user_id/:worksapce_id', function(req, res, next){
  let workspaceName = req.body.workspace_name;// ワークスペース名
  let filename = workspaceName;
  let dirname = 'all_user_dir/' + req.session.user_id  + '/' + workspaceName;

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
  createTexFile(dirname, filename);//Texフアイルを作成
  res.send(jsonData);
});

// Texファイル作成メソッド
createTexFile = function(dirname , filename){
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
};

module.exports = router;
