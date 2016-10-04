## Commands

* `gulp` - build project
* `gulp prod` - build project in prod env
* `gulp prod:serve` - build project in prod env and serve it
* `gulp dev` - run dev server: it watch for all files and automatically rebuild project when they changes
* `gulp dev:serve` - build project in dev env and serve it
gulp.task('', gulp.series('clean', gulp.parallel('blocks:styles', 'lint:styles', 'blocks:assets'), 'html'));
gulp.task('prod', gulp.series('default', 'revision:hash', 'revision:replace'));
gulp.task('prod:serve', gulp.series('default', 'revision:hash', 'revision:replace', 'serve'));
gulp.task('dev', gulp.series('default', gulp.parallel('watch', 'serve:watch')));
gulp.task('dev:serve', gulp.series('default', 'serve'));
