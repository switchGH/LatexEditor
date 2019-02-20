const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const execSync = require('child_process').execSync;
const connection = require('../model/mysqlConnection');

router.get('/:user_id', function(req, res, next){
  let userId = req.session.user_id;
  let getUsersQuery = 'SELECT * FROM users WHERE user_id = ' + userId;// user_idを基にデータ取得
  let getWorkspacesQuery = 'SELECT W.workspace_id, W.workspace_name, U.user_name, DATE_FORMAT(W.created_at, \'%Y年%m月%d日 %k時%i分%s秒\') AS created_at FROM workspaces W LEFT OUTER JOIN users U ON W.user_id = U.user_id';

  if(req.params.user_id == userId){
    connection.query(getUsersQuery, function(err, users){
      connection.query(getWorkspacesQuery, function(err, workspaces){
        res.render('workspace', {
          title: users[0].user_name,
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

//ワークスペースディレクトリ作成
createWorkspace = function(userId, workspaceName){
  let path = 'all_user_dir/';
  // ユーザーディレクトリ作成
  try{
    fs.statSync(path + userId);
    console.log('ユーザーディレクトリは存在します');
  }catch(e){
    if(e.code == 'ENOENT'){
      console.log('ユーザーディレクトリが存在しません');
      execSync('mkdir ' + path + userId);
      console.log(userId + 'ディレクトリを作成しました');
    }
    execSync('mkdir ./all_user_dir/' + userId);//ユーザーの親ディレクトリ作成
  }
  // ワークスペースを作成
  try {
    //同じワークスペース作成済みの場合
    fs.statSync(path + userId + '/' + workspaceName);
    console.log(workspaceName + 'は存在します');
  }catch(e){
    //ワークスペースが存在しない
    if(e.code === 'ENOENT'){
      console.log(workspaceName + 'は存在しません');
      execSync('mkdir ./all_user_dir/'+ userId + '/' + workspaceName).toString();
      console.log(workspaceName + 'を作成しました');
    }else {
      console.log(e);
    }
  }
};

module.exports = router;