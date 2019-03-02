const express = require('express');
const router = express.Router();
const connection = require('../model/mysqlConnection');
const fs = require('fs');
const execSync = require('child_process').execSync;

router.get('/:user_id/:workspace_id', function(req, res, next){
  let workspaceId = req.params.workspace_id;
  let userId = req.session.user_id;
  let getWorkspacesQuery = 'SELECT * FROM workspaces WHERE workspace_id = ' + workspaceId + ' AND user_id =' + userId;

  if(userId == req.params.user_id){
    connection.query(getWorkspacesQuery, function(err, workspaces){
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

      let textData = fs.readFileSync(texFile).toString();// texファイルの内容をdata変数に格納
      console.log(textData);
      textData = textData.replace(new RegExp(/\\/g), '\\\\');//　「\」を「\\」に置換し、editor(クライアント)に表示する
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
  let fileName = workspaceName;
  let dirPath = 'all_user_dir/' + req.session.user_id  + '/' + workspaceName;

  jsonData = JSON.stringify(req.body.msg).slice(1, -1);
  //jsonを受け取り、文頭・文末の「"」を削除する
  let arr = jsonData.split(/\\n/);
  //var arr = jsonData.split(/(?!\\\\newpage)(?=\\n)/);
  // \newpageの処理は保留

  /* ファイルを白紙にする */
  fs.writeFileSync(dirPath + '/' + fileName + '.tex', '', function(err){
    if(err){
      console.log('エラー発生 ' + err);
      throw err;
    }else{
      console.log('ファイルの白紙に成功');
    }
  });

  /* ファイルを更新する */
  for (var i = 0; i < arr.length; i++){
    arr[i] = arr[i].replace(/\\\\/g, '\\');
    //指定のディレクトリにtexファイル生成
    fs.appendFileSync(dirPath + '/' + fileName + '.tex', arr[i] + '\n', function (err) {
      console.log(err);
    });
  }
  createTexFile(dirPath, fileName);//Texフアイルを作成
  res.send(jsonData);
});

// Texファイル作成メソッド
createTexFile = function(dirPath , fileName){
  // ディレクトリの存在を確認 ＊今後使用する予定
  try {
    fs.statSync(dirPath);
    console.log('ディレクトリは存在します。');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('ディレクトリは存在しません。');
      fs.mkdirSync(dirPath);// ディレクトリ作成
      console.log(dirPath + 'を作成しました。');
    } else {
      console.log(error);
    }
  }

  //platexコンパイルの実行
  try {
    console.log('texファイルをコンパイルします。');
    let texFile = dirPath + '/' + fileName  + '.tex';
    execSync('platex ' + texFile + ' -output-directory=' + dirPath).toString();
    execSync('platex ' + texFile + ' -output-directory=' + dirPath).toString();
    //console.log('生成したファイルを' + dirPath + '移動します');
    //execSync('mv ' + fileName + '.* ./' + dirPath);// 変更すべき箇所
    /* .aux, .dvi, .log, .tex, .toc ファイルをワークスペースディレクトリに移動させる*/
    execSync('mv ' + fileName + '.aux ./' + dirPath);
    execSync('mv ' + fileName + '.dvi ./' + dirPath);
    execSync('mv ' + fileName + '.log ./' + dirPath);
    execSync('mv ' + fileName + '.toc ./' + dirPath);
    //execSync('mv ' + fileName + '.tex ./' + dirPath);
  } catch (error) {
    console.log(error);
  }

  //dviodfmxファイルのコンパイル
  try {
    let filePath = dirPath + '/' + fileName;
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
