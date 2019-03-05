const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const execSync = require('child_process').execSync;
const connection = require('../model/mysqlConnection');

router.get('/:user_id', function(req, res, next){
  let userId = req.session.user_id;
  let getUsersQuery = 'SELECT * FROM users WHERE user_id = ' + userId;// user_idを基にデータ取得
  let getWorkspacesQuery = 'SELECT workspace_id, workspace_name, user_id, DATE_FORMAT(created_at, \'%Y年%m月%d日 %k時%i分%s秒\') AS created_at FROM workspaces WHERE user_id = ' + userId;
  if(req.params.user_id == userId){
    connection.query(getUsersQuery, function(err, users){
      connection.query(getWorkspacesQuery, function(err, workspaces){
        //console.log('workspaces: ' + workspaces[0]);
        res.render('workspace', {
          user: users[0],
          workspaceList: workspaces
        });
      }); 
    });
  }else{
    res.redirect('/logout');
  }
});

router.post('/:user_id', function(req, res){
  let userId = req.session.user_id;
  let workspaceName = req.body.workspace_name;
  let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  // データをDBに入れる
  let query = 'INSERT INTO workspaces (user_id, workspace_name, created_at) VALUES ("' + userId + '", ' + '"' + workspaceName + '", ' + '"' + createdAt + '")';
  //ワークスペースディレクトリ作成
  createWorkspace(userId, workspaceName);
  connection.query(query, function(err, rows){
    console.log(rows);
    res.redirect('/workspace/' + userId);
  });
});

/* ワークスペースディレクトリ作成 */
createWorkspace = function(userId, workspaceName){
  let userDirPath = 'all_user_dir/' + userId;
  /* ユーザーディレクトリ作成 */
  try{
    fs.statSync(userDirPath);
    console.log('ユーザーディレクトリは存在します');
  }catch(e){
    if(e.code == 'ENOENT'){
      console.log('ユーザーディレクトリが存在しません');
      execSync('mkdir ' + userDirPath);
      console.log(userDirPath + 'ディレクトリを作成しました');
    }
  }
  /* ワークスペースを作成 */
  let workspaceDirPath = userDirPath + '/' + workspaceName;
  try {
    //同じワークスペース作成済みの場合
    fs.statSync(workspaceDirPath);
    console.log(workspaceName + 'は存在します');
  }catch(e){
    //ワークスペースが存在しない
    if(e.code === 'ENOENT'){
      console.log(workspaceName + 'は存在しません');
      execSync('mkdir ' + workspaceDirPath).toString();
      console.log(workspaceDirPath + 'を作成しました');
    }else {
      console.log(e);
    }
  }
};

module.exports = router;