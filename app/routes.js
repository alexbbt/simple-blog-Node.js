module.exports = function(app, db, passport) {

	// console.log(db);
	var config = {};
	db.config(function(response){
		config = response;
	});


	// index page 
	app.get('/', function(req, res) {
		index(req, res, false);
	});

	app.all('/admin*', passport.authenticate('basic', { session: false }));

	app.get('/admin/logout', function (req, res){
		req.logOut();
		res.status(401).send("logged out");
		res.redirect('/');
	});
	
	app.get('/admin', function(req, res) {
		db.adminBlogs(function(rows) {
			res.render('admin/index', {
				title: 'Blog Admin Page',
				blogs: rows,
				config: config
			});
		});
	});

	app.get('/admin/new', function(req, res) {
		db.authors(function(rows) {
			res.render('admin/edit', {
				config: config,
				authors: rows,
				title: 'New Blog Entry',
				edit: false,
				blog: {
					title: '',
					preview: '',
					text: ''
				}
			});
		});
	});

	app.get('/admin/edit/:blog', function(req, res) {
		db.authors(function(authors) {
			db.blog(req.params.blog, function(blog) {
				res.render('admin/edit', {
					config: config,
					authors: authors,
					title: 'Edit Blog Entry',
					edit: true,
					blog: blog
				});
			});
		});
	});

	app.get('/admin/authors', function(req, res) {
		db.authors(function(rows) {
			res.render('admin/authors', {
				config: config,
				authors: rows,
				title: 'Author List'
			});
		});
	});

	app.get('/admin/site', function(req, res) {
		res.render('admin/site', {
			config: config,
			title: 'Site Settings'
		});
	});

	app.post('/admin/save', function(req, res) {
		db.save(req.body, function(dbres) {
			res.send(JSON.stringify(dbres));
			db.config(function(response){
				config = response;
			});
		});
	});

	app.get('/:blog', function(req, res) {
		db.blog(req.params.blog, function(row) {
			if (row['status'] == 404) {
				index(req, res, true);
				return
			}
			res.render('pages/blog', {
				blog: row,
				config: config
			});
		});
	});

	//The 404 Route (ALWAYS Keep this as the last route)
	app.get('*', function(req, res){
	  res.status(404).send('Page not found <a href="' + config['blogUrl'] + '">Home</a>');
	});

	var index = function(req, res, error) {
		db.blogs(function(rows) {
			res.render('pages/index', {
				blogs: rows,
				config: config,
				error: error
			});
		});
	}
};
