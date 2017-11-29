var gulp = require("gulp");
var path = require('path');
var argv = require("yargs").argv;
var inject = require('gulp-inject');
var spritesmith = require('gulp.spritesmith');
//var imagesNormalizer = require('gulp-retina-sprites-normalizer');// smith retina 需要绝对成倍数的两份图片，它可以帮你办到
var merge = require('merge-stream');
//var es = require('event-stream');

// 先生成图片精灵与对应的css，如果要生成多张图片精灵，请根据图标的名称更改module变量，多次生成
// 再向html 插入css 跟调用

const Spritify = require('spritify');

// sprite module
var module = 'ico';
if(argv.module==='ico2'){
	module= 'ico2'
}

var spritesGroup = {
		spritesPath: './src/img',
		chunksMask: module+'/*.png',
		chunksMaskRetina: module+'/*@2x.png',
		dist: './build',
		imgDist: './build'
}
gulp.task('retina', function () {

     // You can specify your retina images names first 
   // imagesNormalizer.ImagesPadding.prototype.retinaSrcFilter = spritesGroup.chunksMaskRetina // default: **/*2x.png 
   // imagesNormalizer.ImagesPadding.prototype.retinaFileSuffix = '@2x.png' // default: @2x.png 
    
  var spriteData = gulp.src(path.join(spritesGroup.spritesPath, spritesGroup.chunksMask))
  	//.pipe(imagesNormalizer())
  	.pipe(spritesmith({
  		padding: 10,
			imgName: './icon/'+module+'.png',
			imgPath: './icon/'+module+'.png',
			retinaSrcFilter: path.join(spritesGroup.spritesPath, spritesGroup.chunksMaskRetina),
			retinaImgName: './icon/'+module+'@2x.png',
			cssName: module+'.css'
	 
		}));
		var imgStream = spriteData.img.pipe(gulp.dest(spritesGroup.imgDist));
		var cssStream = spriteData.css.pipe(gulp.dest(spritesGroup.dist));
		return merge(imgStream, cssStream);
});

gulp.task('inject', function() {
var $target = gulp.src('./src/index.html');

    var imgStream = inject(gulp.src(path.join(spritesGroup.spritesPath, './**/*.png'), {read: false}), {
      transform: function (filepath,file) {
        if (filepath.slice(-4) === '.png') {
        	var src = file.relative.replace(/\//g,"-").replace(".png","");
          var name = file.relative.replace(/(.+)\//g,"").replace(".png","");
          if(/(@2x)+/.test(name)){
            return false;
          }
          var className= 'icon-'+name;
          return '<li>'+
          '<i class="icon '+className+'"></i>'+
          '    <div class="icon-class">.'+className+'</div>'+
          '</li>';
        }
        // Use the default transform as fallback:
        return inject.transform.apply(inject.transform, arguments);
      }
    })
 
  
  var cssStream =inject(gulp.src(path.join(spritesGroup.dist, './*.css'), {read: false}),{
    transform: function (filepath,file) {
     
      if (filepath.slice(-4) === '.css') {
        
        var name = file.relative.replace(/(.+)\//g,"");
        return '<link rel="stylesheet" href="./'+name+'">';
      }
      return inject.transform.apply(inject.transform, arguments);
    }
  })
  
  
  	return $target.pipe(imgStream).pipe(cssStream)
  	.pipe(gulp.dest(spritesGroup.dist));
});

gulp.task('help',function(){
  /* 
    1. 按图片模块打包不同的sprite
    2. 生成对应的html，预览sprite
  */
  console.info('gulp retina                  生成sprite和对应的css');
  console.info('gulp inject                  生成demo预览');
})
