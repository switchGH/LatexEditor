const express = require('express');
const router = express.Router();
const connection = require('../model/mysqlConnection');
const fs = require('fs');
const execSync = require('child_process').execSync;

router.get('/:user_id/:workspace_id', function(req, res, next){
  let workspaceId = req.params.workspace_id;
  let userId = req.session.user_id;
  let getUWorkspacesQuery = 'SELECT * FROM workspaces WHERE workspace_id = ' + workspaceId + ' AND user_id =' + userId;

  if(userId == req.params.user_id){
    connection.query(getUWorkspacesQuery, function(err, workspaces){
      let texFile = 'all_user_dir/' + workspaces[0].user_id + '/' + workspaces[0].workspace_name + '/' + workspaces[0].workspace_name + '.tex';// 作成するTexファイル
      console.log('作成するTexファイル：' + texFile);
      /* Texファイルの存在確認 */
      try {
        fs.statSync(texFile);
        console.log('texは存在します。');
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(texFile + 'は存在しません。');
          execSync('touch ' + texFile).toString();
          console.log(texFile + 'を作成しました');
        } else {
          console.log(error);
        }
      }

      let data = fs.readFileSync(texFile).toString();// texファイルの内容をdata変数に格納
      console.log('処理前： ' + data);
      let textData = data.replace(new RegExp(/\\/g), '\\\\');//　「\」を「\\」に置換し、editor(クライアント)に表示する
      console.log('処理後： ' + data);
      res.render('editor', {
        title: 'Latex Editor',
        workspace: workspaces[0],
        text: textData
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
  console.log('jsonData ' + jsonData);
  //jsonを受け取り、文頭・文末の「"」を削除する
  var arr = jsonData.split(/\\n/);
  //var arr = jsonData.split(/(?!\\\\newpage)(?=\\n)/);
  // \newpageの処理は保留
  for (var i = 0; i < arr.length; i++){
    arr[i] = arr[i].replace(/\\\\/g, '\\');
    //指定のディレクトリにtexファイル生成
    fs.appendFileSync(dirname + '/' + filename + '.tex', arr[i] + '\n', function (err) {
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
  // try {
  //   fs.statSync(filename + '.tex');
  //   console.log('texは存在します。');
  // } catch (error) {
  //   if (error.code === 'ENOENT') {
  //     console.log('texファイルは存在しません。');
  //   } else {
  //     console.log(error);
  //   }
  // }

  //platexコンパイルの実行
  try {
    console.log('texファイルをコンパイルします。');
    // execSync('platex ' + filename + '.tex -output-directory=' + dirname).toString();
    // execSync('platex ' + filename + '.tex -output-directory=' + dirname).toString();

    let texFile = dirname + '/' + filename  + '.tex';
    execSync('platex ' + texFile + ' -output-directory=' + dirname).toString();
    execSync('platex ' + texFile + ' -output-directory=' + dirname).toString();

    //console.log('生成したファイルを' + dirname + '移動します');
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
