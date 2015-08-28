/*
*
*create by zhouzuchuan (.com)
*https://github.com/zhouzuchuan/picFocus
*兼容性 ： IE6+/FF/Chrome...
*版本 ： v1.0.0 【2015.05.18】
*        v1.0.1 【2015.07.03】
*                # 解决一个页面不能引用多次的bug
*        v1.0.2 【2015.08.12】
*                # 扩展api ,提高灵活性
*
*/

;(function ($) {


  if ($.fn.picFocus) return;

  // 给页面装载默认css
  var style = '<style type="text/css">' +
              '.pf_picWrap {position: relative;overflow: hidden;z-index: 1;}' +
              '.pf_picWrap ul {position: absolute;left: 0;top: 0;font-size: 0;letter-spacing: -4px;z-index: 1;}' +
              '.pf_picWrap ul li {position: relative;display: inline-block;max-height: 100%;font-size: 12px;letter-spacing: 0;overflow: hidden;text-align: center;vertical-align: middle;*float: left;}' +
              '.pf_loading {position: absolute;left: 0;top: 0;width: 100%;text-align: center;background: #fff;z-index: 10;}' +
              '.pf_loading span {position: absolute;left: 0;top: 50%;display: inline-block;width: 100%;font-size: 20px;color: #666;font-family: Microsoft YaHei;}' +
              '.pf_loading em , .pf_loading strong {display: inline-block;vertical-align: middle;font-weight: normal;}' +
              '.pf_loadingIco {width: 32px;height: 32px;margin-right: 10px;background-size: contain;}' +
              '.pf_txtWrap {position: relative;margin-top: -40px;height: 40px;line-height: 40px;z-index: 5;overflow: hidden;}' +
              '.pf_txtUl {position: absolute;left: 0;top: 0;z-index: 2;}' +
              '.pf_txtLi {display: none; padding: 0 30px;font-size: 20px;color: #fff; background: transparent;}' +
              '.pf_txtLi.active {display: inline-block;}' +
              '.pf_txtBg {position: absolute;left: 0;top: 0;width: 100%;height: 100%;background: #888;opacity: .5;filter: alpha(opacity=50);z-index: 1;}' +
              '.pf_thumbWrap {position: relative;overflow: hidden;}' +
              '.pf_thumbUl {position: relative;letter-spacing: -4px;font-size: 0;}' +
              '.pf_thumbLi , .pf_thumbLiPic , .pf_thumbLiPoint {display: inline-block;letter-spacing: 0;font-size: 12px;cursor: pointer;*float: left;zoom: 1;}' +
              '.pf_thumbLi img , .pf_thumbLiPic img , .pf_thumbLiPoint img {width: 100%;height: 100%;}' +
              '.pf_thumbLiPic {padding: 4px;height: 60px;}' +
              '.pf_thumbLiPoint {display: inline-block;width: 10px;height: 5px;background: #fff;overflow: hidden;}' +
              '.pf_thumbLiPic.active , .pf_thumbLiPoint.active {background: orange;}' +
              '.pf_next , .pf_prev {position: absolute;top: 50%;display: inline-block;width: 50px;height: 50px;line-height: 50px;font-size: 40px;font-weight: bold;color: #fff;font-family: SimHei;margin-top: -25px;text-align: center;background: #000;cursor: pointer;opacity: .5;filter: alpha(opacity=50);z-index: 2;}' +
              '.pf_next:hover , .pf_prev:hover {opacity: .9;filter: alpha(opacity=90);}' +
              '.pf_next {right: 20px;}' +
              '.pf_prev {left: 20px;}' ;

  $('head').append(style);

  $.fn.picFocus = function (options) {

    // 内部存储调用区块
    var configs = {
      ele : $(this) ,
      eul : $(this).children('ul') ,
      eli : $(this).children('ul').children('li')
    }

    if (this.length > 1) {
      return this.each(function () {
        $(this).picFocus(options , configs);
      });
    }

    options = $.extend({} , configs , options || {});

    $.picFocus(options , configs);

  }
  var external = {},internal = {};


  $.picFocus = function (options , configs) {

    // 外部储存调用区块
    var external = $.extend({} , options || {});
    // var external = $.extend({} , pfDefault , options || {});

    var internal = $.extend({} , configs , {
      btnNext : '.pf_next' ,
      btnPrev : '.pf_prev' ,
      thumbDom : '.pf_thumbUl' ,
      txtDom : '.pf_txtUl' ,
      width: '' ,
      height: '' ,
      realTimeParam : {},      /*实时参数动态改变*/
      index : 1 ,              /*当前显示的下标*/
      removing : 0 ,           /*储存移动的距离*/
      moveSwitch : true ,      /*动画执行开关*/
      ifHoverOut : '' ,        /*鼠标是否还悬浮在对象上*/
      directionNum : -1 ,
      eliSize : 0 ,
      timer : ''  ,
      interval : 2000 ,
      duration : 500 ,
      easing : 'swing' ,
      nowIndex : 0 ,
      nextIndex : 0 ,
      loadingShow : true ,
      loadingText : '玩命加载中！' ,
      loadingImgSrc : 'http://365jia.cn/images/load.gif' ,
      thumbShow : false ,
      thumbShowSize : 5 ,
      thumbStatus : 2 ,
      thumbArr : [] ,          /*储存缩略图下标*/
      copySize : 1 ,           /*存储额外复制添加的节点数*/
      txtShow : false
    });


    // 方法
    var fun = {};
    // 初始化
    fun._init = function () {

      var lastDom = '' , firstDom = '' , zhou;


      internal.eliSize = internal.eli.length;
      internal.width = is_number(external.width) ? external.width : internal.ele.width();
      internal.height = is_number(external.height) ? external.height : internal.ele.height();
      internal.removing = internal.width;

      // 处理复制多少节点
      internal.copySize = is_undefined(external.copySize) ? internal.copySize : (external.copySize > internal.eliSize) ? internal.eliSize : external.copySize ;
      internal.eli.slice((internal.eliSize - internal.copySize) , internal.eliSize).each(function (index , element) {
        lastDom += '<li>' + $(element).html() + '</li>';
      });
      internal.eli.slice(0 , internal.copySize).each(function (index , element) {
        firstDom += '<li>' + $(element).html() + '</li>';
      })

      internal.ele.css({'position' : 'relative'});
      internal.eul.wrap('<div class="pf_picWrap"></div>')
                  .append(firstDom)
                  .prepend(lastDom)
                  .width(internal.removing * (internal.eul.children('li').size() + 2)).css({
                    'height' : internal.height
                  }).parent().css({
                    'width' : internal.width ,
                    'height' : internal.height
                  }).find('li').width(internal.width);

      internal.eul.addClass('pf_picUl');
      internal.eul.children('li').addClass('pf_picLi');

      // 處理默認顯示
      internal.showIndex = is_number(external.showIndex) ? external.showIndex : 0

      if (internal.showIndex >= 0 && internal.showIndex <= internal.eliSize) {
        internal.index = internal.showIndex + internal.copySize ;
      } else if (internal.showIndex > internal.eliSize) {
        internal.index = (internal.showIndex % internal.eliSize) + 1 ;
      }

      zhou = internal.copySize > 1 ? (internal.copySize - 1) : 0 ;
      if (internal.index == (internal.eliSize + internal.copySize)) {
        internal.index = internal.copySize;
      } else if (internal.index == zhou) {
        internal.index = internal.eliSize + zhou;
      }


      internal.eul.css({'left' : (internal.index * internal.directionNum) * internal.removing});

      internal.nowIndex = internal.showIndex >= internal.eliSize  ? (internal.showIndex % internal.eliSize) : internal.showIndex ;


      // 處理按鈕懸浮方式
      internal.ele.find(internal.btnPrev).hide();
      internal.ele.find(internal.btnNext).hide();
      if (is_string(external.next) && is_string(external.prev)) {
        if (is_false(external.hideNextPrev)) {
          internal.ele.find(internal.btnPrev).show();
          internal.ele.find(internal.btnNext).show();
        }
      } else {
        if (!is_true(external.hideNextPrev)) {
          internal.eul.after('<span class="pf_next">&gt;</span><span class="pf_prev">&lt;</span>');
          if (external.hideNextPrev == 'hover') {
            internal.ele.find(internal.btnPrev).hide();
            internal.ele.find(internal.btnNext).hide();
          }
        }
      }


      // 处理缩略动态下标数组
      // if (internal.nowIndex > internal.thumbShowSize || is_undefined(internal.thumbFirstMove)) {
      if (internal.nowIndex > internal.thumbShowSize || !is_undefined(internal.showIndex)) {
        internal.thumbArr = [0 , internal.thumbShowSize - internal.copySize] ;
      } else {
        internal.thumbArr = [internal.nowIndex - (internal.thumbShowSize - internal.copySize) , internal.nowIndex] ;
      }

      // 添加缩略图
      if (is_true(internal.thumbShow)) {
        internal.ele.append('<div class="pf_thumbWrap"><ul class="pf_thumbUl"></ul></div>');
        var oFragment = document.createDocumentFragment() , tw , otherW ;
        for (var i = 0 ; i < internal.eliSize ; i ++) {
          var li = document.createElement('li');
          li.className = 'pf_thumbLi';
          if (internal.thumbStatus === 2) {
            var img = document.createElement('img');
            img.src = internal.eli.eq(i).find('img').attr('src');
            li.className = 'pf_thumbLiPic' ;
            li.appendChild(img);
          } else if (internal.thumbStatus === 1) {
            li.className = 'pf_thumbLiPoint' ;
          }
          oFragment.appendChild(li);
        }
        internal.ele.find(internal.thumbDom).append(oFragment);

        // 处理缩略高度和宽度
        otherW = internal.ele.find(internal.thumbDom).find('li').outerWidth(true) - internal.ele.find(internal.thumbDom).find('li').width();
        if (internal.thumbShowSize <= internal.eliSize && internal.thumbStatus != 1) {
          tw = Math.ceil(internal.width / internal.thumbShowSize) ;
        } else {
          tw = Math.ceil(internal.width / internal.eliSize) ;
        }
        internal.ele.find(internal.thumbDom).find('li').width(tw - otherW);
        internal.ele.find(internal.thumbDom).width(tw * internal.eliSize).parent().css({
          'width' : internal.width
        });

        // 处理缩略自定义样式
        if (is_object(external.thumb.style)) {
          internal.ele.find(internal.thumbDom).find('li').css(external.thumb.style);
        }
        // 处理缩略点击
        internal.ele.find(internal.thumbDom).find('li').click(function () {
          if (!internal.moveSwitch) return false ;
          internal.index = $(this).index() + internal.copySize ;
          fun._clickMove(null , $(this).parents(internal.ele));

        });
        // 处理缩略默认显示
        fun._thumbClick(internal.nowIndex);
      }

      // 添加提示文字
      if (is_true(internal.txtShow)) {
        internal.eul.parent().after('<div class="pf_txtWrap"><ul class="pf_txtUl"></ul><p class="pf_txtBg"></p></div>');
        var oFragment = document.createDocumentFragment();
        for (var i = 0 ; i < internal.eliSize ; i ++) {
          var li = document.createElement('li');
          li.className = 'pf_txtLi'
          var span = document.createElement('span');
          span.innerHTML = internal.eli.eq(i).find('img').attr('title');
          li.appendChild(span);
          oFragment.appendChild(li);
        }
        internal.ele.find(internal.txtDom).append(oFragment);
        internal.ele.find(internal.txtDom).parent().css({
          'width' : internal.width
        });
        fun._switchTxt(internal.nowIndex);
      }

      // 上一个
      internal.ele.find(internal.btnPrev).click(function () {
          clearInterval(internal.timer);
          fun._clickMove('prev' , $(this).parents(internal.ele));
      });

      // 下一个
      internal.ele.find(internal.btnNext).click(function () {
          clearInterval(internal.timer);
          fun._clickMove('next' , $(this).parents(internal.ele));
      });

      // 前后按钮显示与隐藏
      internal.eul.parent().on({
        mouseenter : function () {
          if (external.hideNextPrev == 'hover') {
            internal.ele.find(internal.btnNext).show() ;
            internal.ele.find(internal.btnPrev).show() ;
          }
          if (is_true(external.hoverStop)) {
            clearInterval(internal.timer);
            internal.ifHoverOut = true ;
          }
        } ,
        mouseleave : function () {
          if (external.hideNextPrev == 'hover') {
            internal.ele.find(internal.btnNext).hide() ;
            internal.ele.find(internal.btnPrev).hide() ;
          }
          if (is_true(external.hoverStop)) {
            internal.ifHoverOut = false ;
            internal.timer = setInterval(debugDirection , internal.interval);
          }
        }
      });

      // 更新实时参数
      internal.realTimeParam = {
        nowImg : internal.eli.eq(internal.nowIndex).find('img') ,
        totalSize : internal.eliSize ,
        nowIndex : internal.nowIndex ,
        nextIndex : internal.nextIndex
      }
    } ;
    // 前后按钮函数
    fun._clickMove = function (a , b) {
      if (!internal.moveSwitch) return false ;
      internal.moveSwitch = false ;
      clearInterval(internal.timer);
      var chuan = 1 ;
      if (a === 'next') {
        internal.index ++ ;
      } else if (a === 'prev') {
        internal.index -- ;
        chuan = -1 ;
      }

      // 處理现在显示图片的下標(nowIndex)和下一个图片的下标(nextIndex)以及整体图片的下标(index)
      internal.nowIndex = internal.index - internal.copySize ;
      console.log(internal.nowIndex + ':' + internal.index);
      internal.nextIndex = internal.nowIndex + chuan ;
      if (internal.nowIndex >= internal.eliSize ) {
        internal.nowIndex %= internal.eliSize ;
      } else if (internal.nowIndex < 0) {
        internal.nowIndex += internal.eliSize ;
      }
      if (internal.nextIndex >= internal.eliSize) {
        internal.nextIndex %= internal.eliSize ;
      } else if (internal.nextIndex < 0) {
        internal.nextIndex += internal.eliSize ;
      }

      fun._thumbClick(internal.nowIndex);
      // 運動
      b.children('.pf_picWrap').find('ul').stop().animate({
        'left' : (internal.index * internal.directionNum) * internal.removing
      },internal.duration , internal.easing).queue(function (next) {
        var zhou = internal.copySize > 1 ? (internal.copySize - 1) : 0 ;
        if (internal.index == (internal.eliSize + internal.copySize)) {
          internal.index = internal.copySize;
        } else if (internal.index == zhou) {
          internal.index = internal.eliSize + zhou;
        }
        b.children('.pf_picWrap').find('ul').css('left',(internal.index * internal.directionNum) * internal.removing);
        internal.moveSwitch = true ;
        next();
        // 更新实时参数
        internal.realTimeParam = {
          nowImg : internal.eli.eq(internal.nowIndex).find('img') ,
          totalSize : internal.eliSize ,
          nowIndex : internal.nowIndex ,
          nextIndex : internal.nextIndex
        }

        fun._switchTxt(internal.nowIndex);
        if (is_function(external.after)) {
          external.after(internal.realTimeParam );
        }
        if (!is_true(external.auto)) return false;
        if (is_true(internal.ifHoverOut)) return false
        clearInterval(internal.timer);
        internal.timer = setInterval(debugDirection , internal.interval);

      });
    };
    fun._thumbClick = function (n) {
      if (!is_true(internal.thumbShow)) return false;
      if (internal.eliSize > internal.thumbShowSize && internal.thumbStatus != 1) {

        // 处理实时缩略动态下边数组
        if (n >= Math.max.apply(null , internal.thumbArr)) {
          if (n >= internal.eliSize - 1) {
            internal.thumbArr = [internal.eliSize - internal.thumbShowSize , internal.eliSize - 1] ;
          } else {
            internal.thumbArr = [n - (internal.thumbShowSize - 2) , n + 1] ;
          }
        } else if (n <= Math.min.apply(null , internal.thumbArr)) {
          if (n <= 0) {
            internal.thumbArr = [0 , internal.thumbShowSize - 1] ;
          } else {
            internal.thumbArr = [n - 1 , n + (internal.thumbShowSize - 2)] ;
          }
        }

        // if (!is_undefined(internal.thumbFirstMove)) {
          internal.ele.find(internal.thumbDom).stop().animate({
            'left' : - Math.min.apply(null , internal.thumbArr) * internal.ele.find(internal.thumbDom).find('li').outerWidth(true)
          },internal.duration , internal.easing);
        // }
      }

      internal.ele.find(internal.thumbDom).find('li').each(function (index , element) {
        $(element).removeClass('active');
      });
      internal.ele.find(internal.thumbDom).find('li').eq(n).addClass('active');
      // internal.thumbFirstMove = 'zhouzuchuan' ;
    } ,
    fun._switchTxt = function (n) {
      if (!is_true(internal.txtShow)) return false;
      internal.ele.find(internal.txtDom).find('li').each(function (index , element) {
        $(element).removeClass('active');
      });
      internal.ele.find(internal.txtDom).find('li').eq(n).addClass('active');
    } ,
    fun._imgLoad = function (obj ,callback) {
      var timer2 = setInterval(function() {
        if (obj.complete || (obj.width && obj.height && document.all)) {
          callback(obj);
          clearInterval(timer2);
        }
      },30);
    } ,
    fun._loading = function () {
      if (!is_true(internal.loadingShow)) return false;
      internal.eul.find('li').each(function (index , element) {
        $(element).append('<div class="pf_loading"><span class=""><em></em><strong>' + internal.loadingText + '</strong></span></div>');
        // if (!is_false(internal.loadingImgSrc)) {
          $(element).find('.pf_loading').find('em').addClass('pf_loadingIco').css({
            'background-image' :  'url(' + internal.loadingImgSrc + ')'
          });
        // }
        fun._imgLoad($(element).find('img').get(0) , function (obj) {
          $(obj).parents('li').find('.pf_loading').remove();
        });
      });
      $('.pf_loading').height(internal.height);
      if (is_function(external.loadAfter)) {
        external.loadAfter(internal.realTimeParam);
      }
    }

    // 指定按鈕
    if (is_string(external.next)) {
      internal.btnNext = external.next;
    }
    if (is_string(external.prev)) {
      internal.btnPrev = external.prev;
    }

    if (is_object(external.thumb)) {
      if (is_true(external.thumb.show)) {
        internal.thumbShow = true ;
      }
      if (is_number(external.thumb.showSize)) {
        internal.thumbShowSize = external.thumb.showSize ;
      }
      if (is_string(external.thumb.status)) {
        switch (external.thumb.status) {
          case 'point' :
            internal.thumbStatus = 1 ;
            break;
          case 'picture' :
            internal.thumbStatus = 2;
            break;
        }
      }
    }

    if (is_object(external.txt)) {
      if (is_true(external.txt.show)) {
        internal.txtShow = true ;
      }
    }

    if (is_object(external.loading)) {

      if (is_false(external.loading.show)) {
        internal.loadingShow = false ;
      }

      if (is_string(external.loading.text)) {
        internal.loadingText = external.loading.text ;
      }
      if (is_string(external.loading.loadingImgSrc)) {
        internal.loadingImgSrc = external.loading.loadingImgSrc ;
      }
    }

    fun._init();
    fun._loading();


    // 處理運動方式
    if (is_object(external.scroll)) {
      if (is_number(external.scroll.interval)) {
        internal.interval = external.scroll.interval;
      }
      if (is_number(external.scroll.duration)) {
        internal.duration = external.scroll.duration;
      }
      if (is_string(external.scroll.easing)) {
        internal.easing = external.scroll.easing;
      }
    }


    // 執行
    if (is_true(external.auto)) {
      clearInterval(internal.timer);
      internal.timer = setInterval(debugDirection, internal.interval);
    }


    // 處理運動方向
    function debugDirection () {
      if (is_string(external.direction) && external.direction == 'left') {
        fun._clickMove('next' , internal.ele);
      } else if (is_string(external.direction) && external.direction == 'right') {
        fun._clickMove('prev' , internal.ele);
      }
    }
  }


  // 輔助方法
  function is_null(a) {
    return (a === null);
  }
  function is_undefined(a) {
    return (is_null(a) || typeof a == 'undefined' || a === '' || a === 'undefined');
  }
  function is_array(a) {
    return (a instanceof Array);
  }
  function is_jquery(a) {
    return (a instanceof jQuery);
  }
  function is_object(a) {
    return ((a instanceof Object || typeof a == 'object') && !is_null(a) && !is_jquery(a) && !is_array(a) && !is_function(a));
  }
  function is_number(a) {
    return ((a instanceof Number || typeof a == 'number') && !isNaN(a));
  }
  function is_string(a) {
    return ((a instanceof String || typeof a == 'string') && !is_undefined(a) && !is_true(a) && !is_false(a));
  }
  function is_function(a) {
    return (a instanceof Function || typeof a == 'function');
  }
  function is_boolean(a) {
    return (a instanceof Boolean || typeof a == 'boolean' || is_true(a) || is_false(a));
  }
  function is_true(a) {
    return (a === true || a === 'true');
  }
  function is_false(a) {
    return (a === false || a === 'false');
  }
  function is_percentage(x) {
    return (is_string(x) && x.slice(-1) == '%');
  }

}) (jQuery);