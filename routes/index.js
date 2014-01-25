
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Meet Me in the Middle' })
};