const express = require('express')
const router = express.Router();
const Category = require('../../models/Category');
const { userAuthenticated } = require('../../helpers/authentication');

router.all('/*', /* userAuthenticated, */  (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get('/', (req, res) => {
  Category.find({})
    .then(categories => {
      res.render('admin/categories/index', {categories, message: req.flash('message')});
    });
});

router.post('/create', (req, res) => {
  category = new Category({
    name: req.body.name
  });
  category.save()
    .then(() => {
      req.flash('message', 'Category is successfully created');
      res.redirect('/admin/categories');
    })
    .catch(err => res.send(err));
});

router.delete('/delete/:id', (req, res) => {
  Category.remove({_id: req.params.id})
    .then(() => {
      req.flash('message', 'Category is successfully deleted');
      res.redirect('/admin/categories');
    })
});

router.get('/edit/:id', (req, res) => {
  Category.findOne({_id: req.params.id}).then(category=> {
    console.log("this is category", category);
    res.render('admin/categories/edit', {category} );
  })
});

router.put('/edit/:id', (req, res) => {
  const { name, id } = req.body;
  Category.findOneAndUpdate({_id: req.params.id}, { $set: {name} })
    .then(category => {
      req.flash('message', `Successfully edited category "${name}" (#${id})`);
      res.redirect('/admin/categories');
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
