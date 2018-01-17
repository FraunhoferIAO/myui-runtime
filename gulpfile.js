const gulp = require('gulp');
const doc = require('gulp-documentation');


gulp.task('apidoc', ['apidoc:html', 'apidoc:md']);

gulp.task('apidoc:html', () => {
	let pkg = require('./package.json');
	return gulp.src('./src/**/*.js')
		.pipe(doc('html', {}, {
			name: pkg.name,
			version: pkg.version
		}))
		.pipe(gulp.dest('./doc'));
});

gulp.task('apidoc:md', () => {
	let pkg = require('./package.json');
	return gulp.src('./src/**/*.js')
		.pipe(doc('md', {}, {
			name: pkg.name,
			version: pkg.version
		}))
		.pipe(gulp.dest('./doc'));
});
