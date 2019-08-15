//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

const { watch, src, dest, series } = require('gulp');
const sass        = require('gulp-sass'),
      nodemon     = require('gulp-nodemon');
      browserSync = require('browser-sync').create();


//////////////////////////////////////////////////
// Create tasks
//////////////////////////////////////////////////

// Start Nodemon
function startNodemon(done) {
  const startupTimeout = 5000;
  const server = nodemon({
    script: 'app.js',
    stdout: false
  });
  let starting = false;
  const onReady = () => {
    starting = false;
    done();
  };

  server.on('start', () => {
    starting = true;
    setTimeout(onReady, startupTimeout);
  });

  server.on('stdout', stdout => {
    process.stdout.write(stdout);
    if(starting) {
      onReady;
    }
  });
}

// Initializae Browser Sync
function browserSyncInit(done) {
  browserSync.init(null, {
    proxy: "http://localhost:3000",
    files: ["public/**/*.*"],
    port: 3001,
  }, done);
}

// Compile SCSS
function scss() {
  return src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./public/css'))
    .pipe(browserSync.stream());
}

// Setup watch tasks
function watching(done) {
  watch('./src/scss/**/*.scss', scss);
  watch('./**/*.ejs').on('change', browserSync.reload);
  done();
}


//////////////////////////////////////////////////
// Set up task names
//////////////////////////////////////////////////

exports.server  = series(startNodemon, browserSyncInit);
exports.scss    = scss;
exports.watch   = watching;
exports.default = series(startNodemon, browserSyncInit, watching);