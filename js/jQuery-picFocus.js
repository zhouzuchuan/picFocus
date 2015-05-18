/*
*
*create by zhouzuchuan (.com)
*https://github.com/zhouzuchuan/picFocus
*兼容性 ： IE6+/FF/Chrome...
*版本 ： v1.0.0 【2015.05.18】
*
*/

;(function ($) {


  if ($.fn.picFocus) return;

  // 给页面装载默认css
  var style = '<style type="text/css">' +
              '.pf_ul_wrap {position: relative;overflow: hidden;z-index: 1;}' +
              '.pf_ul_wrap ul {position: absolute;left: 0;top: 0;font-size: 0;letter-spacing: -4px;z-index: 1;}' +
              '.pf_ul_wrap ul li {position: relative;display: inline-block;max-height: 100%;font-size: 12px;letter-spacing: 0;overflow: hidden;text-align: center;vertical-align: middle;*float: left;}' +
              '.pf_loading {position: absolute;left: 0;top: 0;width: 100%;text-align: center;background: #fff;z-index: 10;}' +
              '.pf_loading span {position: absolute;left: 0;top: 50%;display: inline-block;width: 100%;font-size: 20px;color: #666;font-family: Microsoft YaHei;}' +
              '.pf_loading em , .pf_loading strong {display: inline-block;vertical-align: middle;font-weight: normal;}' +
              '.pf_loading_ico {width: 32px;height: 32px;margin-right: 10px;background-size: contain;}' +
              '.pf_txt_wrap {position: relative;margin-top: -40px;height: 40px;line-height: 40px;z-index: 5;overflow: hidden;}' +
              '.pf_txt_wrap ul {position: absolute;left: 0;top: 0;z-index: 2;}' +
              '.pf_txt_wrap ul li {display: none; padding: 0 30px;font-size: 20px;color: #fff; background: transparent;}' +
              '.pf_txt_wrap ul li.active {display: inline-block;}' +
              '.pf_txt_bg {position: absolute;left: 0;top: 0;width: 100%;height: 100%;background: #888;opacity: .5;filter: alpha(opacity=50);z-index: 1;}' +
              '.pf_thumb_wrap {position: relative;overflow: hidden;}' +
              '.pf_thumb_ul {position: relative;letter-spacing: -4px;font-size: 0;}' +
              '.pf_thumb_ul li {display: inline-block;letter-spacing: 0;font-size: 12px;cursor: pointer;*float: left;}' +
              '.pf_thumb_ul li img {width: 100%;height: 100%;}' +
              '.pf_thumb_pic {padding: 4px;height: 60px;}' +
              '.pf_thumb_point {display: inline-block;width: 10px;height: 5px;background: #fff;overflow: hidden;}' +
              '.pf_thumb_pic.active , .pf_thumb_point.active {background: orange;}' +
              '.pf_next , .pf_prev {position: absolute;top: 50%;display: inline-block;width: 50px;height: 50px;line-height: 50px;font-size: 40px;font-weight: bold;color: #fff;font-family: SimHei;margin-top: -25px;text-align: center;background: #888;cursor: pointer;opacity: .5;filter: alpha(opacity=50);z-index: 2;}' +
              '.pf_next:hover , .pf_prev:hover {opacity: .9;filter: alpha(opacity=90);}' +
              '.pf_next {right: 20px;}' +
              '.pf_prev {left: 20px;}' ;

  $('head').append(style);

  $.fn.picFocus = function (options) {

    // 内部存储调用区块
    var configs = {
      ele : $(this) ,
      eul : $(this).find('ul') ,
      eli : $(this).find('ul').children('li')
    }

    options = $.extend({} , configs , options || {});

    $.picFocus(options , configs);

  }

  $.picFocus = function (options , configs) {

    // 外部储存调用区块
    var external = $.extend({} , pfDefault , options || {});

    var internal = $.extend({} , configs , {
      btnNext : '.pf_next' ,
      btnPrev : '.pf_prev' ,
      thumbDom : '.pf_thumb_ul' ,
      txtDom : '.pf_txt_ul' ,
      width: '' ,
      height: '' ,
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
      thumbFirstMove : '' ,
      thumbShow : false ,
      thumbShowSize : 5 ,
      thumbStatus : 2 ,
      thumbArr : [] ,          /*储存缩略图下标*/
      txtShow : false
    });

    // 方法
    var fun = {
      // 初始化
      _init : function () {


        internal.eliSize = internal.eli.length;
        internal.width = is_number(external.width) ? external.width : internal.ele.width();
        internal.height = is_number(external.height) ? external.height : internal.ele.height();
        internal.removing = internal.width;

        internal.ele.css({'position' : 'relative'});
        internal.eul.wrap('<div class="pf_ul_wrap"></div>')
                    .append('<li>' + internal.eli.first().html() + '</li>')
                    .prepend('<li>' + internal.eli.last().html() + '</li>')
                    .width(internal.removing * (internal.eliSize + 2)).css({
                      'height' : internal.height
                    }).parent().css({
                      'width' : internal.width ,
                      'height' : internal.height
                    }).find('li').width(internal.width);


        // 處理默認顯示
        if (is_number(external.showIndex) && external.showIndex >= 0 && external.showIndex <= internal.eliSize) {
          internal.index = external.showIndex + 1 ;
        } else if (is_number(external.showIndex) && external.showIndex > internal.eliSize) {
          internal.index = (external.showIndex % internal.eliSize) + 1 ;
        }
        if (internal.index >= (internal.eliSize + 1)) {
          internal.index = 1;
        } else if (internal.index <= 0) {
          internal.index = internal.eliSize;
        }
        internal.eul.css({'left' : (internal.index * internal.directionNum) * internal.removing});

        internal.nowIndex = external.showIndex >= internal.eliSize ? (external.showIndex % internal.eliSize) : external.showIndex ;

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

        // 添加缩略图

        if (internal.nowIndex > internal.thumbShowSize || is_undefined(internal.thumbFirstMove)) {
          internal.thumbArr = [0 , internal.thumbShowSize - 1] ;
        } else {
          internal.thumbArr = [internal.nowIndex - (internal.thumbShowSize - 1) , internal.nowIndex] ;
        }

        if (is_true(internal.thumbShow)) {
          internal.ele.append('<div class="pf_thumb_wrap"><ul class="pf_thumb_ul"></ul></div>');
          var oFragment = document.createDocumentFragment() , tw , otherW ;
          for (var i = 0 ; i < internal.eliSize ; i ++) {
            var li = document.createElement('li');
            if (internal.thumbStatus === 2) {
              var img = document.createElement('img');
              img.src = internal.eli.eq(i).find('img').attr('src');
              li.className = 'pf_thumb_pic' ;
              li.appendChild(img);
            } else if (internal.thumbStatus === 1) {
              li.className = 'pf_thumb_point' ;
            }
            oFragment.appendChild(li);
          }
          internal.ele.find(internal.thumbDom).append(oFragment);
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

          if (is_object(external.thumb.style)) {
            internal.ele.find(internal.thumbDom).find('li').css(external.thumb.style);
          }
          internal.ele.find(internal.thumbDom).find('li').click(function () {
            if (!internal.moveSwitch) return false ;
            internal.index = $(this).index() + 1 ;
            fun._clickMove();
          });
          otherFun._thumbClick(internal.index - 1);
        }

        // 添加提示文字
        if (is_true(internal.txtShow)) {
          internal.eul.parent().after('<div class="pf_txt_wrap"><ul class="pf_txt_ul"></ul><p class="pf_txt_bg"></p></div>');
          var oFragment = document.createDocumentFragment();
          for (var i = 0 ; i < internal.eliSize ; i ++) {
            var li = document.createElement('li');
            var span = document.createElement('span');
            span.innerHTML = internal.eli.eq(i).find('img').attr('title');
            li.appendChild(span);
            oFragment.appendChild(li);
          }
          internal.ele.find(internal.txtDom).append(oFragment);
          internal.ele.find(internal.txtDom).parent().css({
            'width' : internal.width
          });
          otherFun._switchTxt(internal.index - 1);
        }

        // 上一个
        internal.ele.find(internal.btnPrev).click(function () {
            clearInterval(internal.timer);
            fun._clickMove('prev');
        });

        // 下一个
        internal.ele.find(internal.btnNext).click(function () {
            clearInterval(internal.timer);
            fun._clickMove('next');
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
      } ,
      // 前后按钮函数
      _clickMove : function (a) {
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

        // 處理下標
        internal.nowIndex = internal.index - 1 ;
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

        otherFun._thumbClick(internal.nowIndex);
        otherFun._switchTxt(internal.nowIndex);
        // 運動
        internal.eul.stop().animate({
          'left' : (internal.index * internal.directionNum) * internal.removing
        },internal.duration , internal.easing).queue(function (next) {

          if (internal.index == (internal.eliSize + 1)) {
            internal.index = 1;
          } else if (internal.index == 0) {
            internal.index = internal.eliSize;
          }
          internal.eul.css('left',(internal.index * internal.directionNum) * internal.removing);
          internal.moveSwitch = true ;
          next();
          if (is_function(external.after)) {
            external.after(internal.nowIndex , internal.nextIndex);
          }
          if (!is_true(external.auto)) return false;
          if (is_true(internal.ifHoverOut)) return false
          clearInterval(internal.timer);
          internal.timer = setInterval(debugDirection , internal.interval);

        });
      }
    }

    var otherFun = {
      _thumbClick : function (n) {
        if (!is_true(internal.thumbShow)) return false;
        if (internal.eliSize > internal.thumbShowSize && internal.thumbStatus != 1) {
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
          if (!is_undefined(internal.thumbFirstMove)) {
            internal.ele.find(internal.thumbDom).stop().animate({
              'left' : - Math.min.apply(null , internal.thumbArr) * internal.ele.find(internal.thumbDom).find('li').outerWidth(true)
            },internal.duration , internal.easing);
          }

        }

        internal.ele.find(internal.thumbDom).find('li').each(function (index , element) {
          $(element).removeClass('active');
        });
        internal.ele.find(internal.thumbDom).find('li').eq(n).addClass('active');
        internal.thumbFirstMove = 'zhouzuchuan' ;
      } ,
      _switchTxt : function (n) {
        if (!is_true(internal.txtShow)) return false;
        internal.ele.find(internal.txtDom).find('li').each(function (index , element) {
          $(element).removeClass('active');
        });
        internal.ele.find(internal.txtDom).find('li').eq(n).addClass('active');
      } ,
      _imgLoad : function (obj ,callback) {
        var timer2 = setInterval(function() {
          if (obj.complete || (obj.width && obj.height && document.all)) {
            callback(obj);
            clearInterval(timer2);
          }
        },30);
      } ,
      _loading : function () {
        if (!is_true(internal.loadingShow)) return false;
        internal.eul.find('li').each(function (index , element) {
          $(element).append('<div class="pf_loading"><span class=""><em></em><strong>' + internal.loadingText + '</strong></span></div>');
          if (!is_false(external.loading.loadingImgSrc)) {
            $(element).find('.pf_loading').find('em').addClass('pf_loading_ico').css({
              'background-image' :  'url(' + internal.loadingImgSrc + ')'
            });
          }
          otherFun._imgLoad($(element).find('img').get(0) , function (obj) {
            $(obj).parents('li').find('.pf_loading').remove();
          });
        });
        $('.pf_loading').height(internal.height);

      }
    }

    // 指定按鈕
    if (is_string(external.next)) {
      internal.btnNext = external.next;
    }
    if (is_string(external.prev)) {
      internal.btnPrev = external.prev;
    }

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
    if (is_true(external.txt.show)) {
      internal.txtShow = true ;
    }
    if (!is_true(external.loading.show)) {
      internal.loadingShow = false ;
    }
    if (is_string(external.loading.text)) {
      internal.loadingText = external.loading.text ;
    }
    if (is_string(external.loading.loadingImgSrc)) {
      internal.loadingImgSrc = external.loading.loadingImgSrc ;
    }
    fun._init();
    otherFun._loading();

    // 處理運動方式
    if (is_number(external.scroll.interval)) {
      internal.interval = external.scroll.interval;
    }
    if (is_number(external.scroll.duration)) {
      internal.duration = external.scroll.duration;
    }
    if (is_string(external.scroll.easing)) {
      internal.easing = external.scroll.easing;
    }

    // 執行
    if (is_true(external.auto)) {
      clearInterval(internal.timer);
      internal.timer = setInterval(debugDirection, internal.interval);
    }


    // 處理運動方向
    function debugDirection () {
      if (is_string(external.direction) && external.direction == 'left') {
        fun._clickMove('next');
      } else if (is_string(external.direction) && external.direction == 'right') {
        fun._clickMove('prev');
      }
    }
  }

  // 對外接口
  var pfDefault = {
    showIndex : 0 ,         /*默认显示的第几张图片 从0开始*/
    direction : 'left',     /*无缝滚动的方向*/
    width : 'auto' ,        /*宽度*/
    height : 'auto' ,       /*高度*/
    next : '' ,             /*指定下一个按钮类*/
    prev : '' ,             /*指定上一个按钮类*/
    auto : true ,           /*开启自动滚动*/
    hideNextPrev : false ,  /*隐藏按钮 'hover'为悬浮出现 'true'为不出现 'false'为出现 */
    hoverStop : false ,     /*悬浮停止运动*/
    loading : {
      show : true ,         /*是否开启加载样式*/
      text : '' ,           /*加载提示文字*/
      loadingImgSrc : ''    /*加载等待动画路径 如果为false则不显示图片*/
    },
    scroll : {
      interval : 2000 ,     /*滚动切换间隔时间*/
      duration : 500 ,      /*滚动运行时间*/
      easing : 'linear'     /*滚动方式*/
    } ,
    thumb : {
      show : false ,         /*是否开启缩略图*/
      status : 'point' ,     /*缩略图状态： 图片状态'picture'  点状态'point' */
      style : {} ,           /*自定义样式（只是在li标签上）*/
      showSize : 5           /*缩略图显示个数*/
    } ,
    txt : {
      show : false           /*是否开启提示文字*/
    },
    after : $.noop           /*切换之后执行的函数内部有两个参数（nowIndex , nextIndex）自动切换下 (现在显示的下标 , 下一个显示的下标)*/
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