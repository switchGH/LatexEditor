var express = require('express');
var router = express.Router();
const fs = require('fs');
const pdfDir = 'all_user_dir/';
// const pdfDir = 'all_user_dir/1/Test/';

/* GET users listing. */
router.get('/:user_id/:workspace_name/:fname', function(req, res, next){
  let fname = req.params.user_id + '/' + req.params.workspace_name + '/' + req.params.fname;
  console.log('fname: ' + fname);
  let pdfPath = pdfDir + fname;
  console.log('pdfPath: ' + pdfPath);
  res.setHeader('Content-Type', 'application/pdf');
  fs.readFile(pdfPath, function(err, data) {
    res.send(data);
  });
});

module.exports = router;
