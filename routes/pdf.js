var express = require('express');
var router = express.Router();
const fs = require('fs');
const pdfDir = 'sampleDir/';

/* GET users listing. */
router.get('/:fname', (req, res, next) => {
  let fname = req.params.fname;
  let pdfPath = pdfDir + fname;
  res.setHeader('Content-Type', 'application/pdf');
  fs.readFile(pdfPath, function(err, data) {
    res.send(data);
  });
});

module.exports = router;
