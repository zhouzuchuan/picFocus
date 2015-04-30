


;(function ($) {


  if ($.fn.picFocus) return;

  $.fn.picFocus = function (options) {
    
    if (this.length == 0) {
      debug( true, 'No element found for "' + this.selector + '".' );
      return this;
    } 

    if (this.length > 1) {
      $(this).picFocus(options , configs);
    }

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
      index : 1 ,              /*当前显示的下标*/         
      removing : 0 ,           /*储存移动的距离*/
      moveSwitch : true ,      /*动画执行开关*/
      ifHoverOut : '' ,      /*鼠标是否还悬浮在对象上*/
      directionNum : -1 ,
      timer : ''  ,
      interval : 2000 ,
      duration : 500 ,
      easing : 'swing' ,
      nowIndex : 0 ,
      nextIndex : 0
    })

    // 方法
    var fun = {
      // 初始化
      _init : function () {

        internal.removing = internal.eli.outerWidth(true);

        internal.ele.css({'position' : 'relative'});

        internal.eul.append('<li>' + internal.eli.first().html() + '</li>');
        internal.eul.prepend('<li>' + internal.eli.last().html() + '</li>');
        internal.eul.width(internal.removing * (internal.eli.length + 2)).css({
          'position' : 'relative' 
        });

        // 處理默認顯示
        if (is_number(external.showIndex) && external.showIndex >= 0 && external.showIndex <= internal.eli.length) {
          internal.index = external.showIndex + 1 ;        
        } else if (is_number(external.showIndex) && external.showIndex > internal.eli.length) {
          internal.index = (external.showIndex % internal.eli.length) + 1 ;
        }
        if (internal.index >= (internal.eli.length + 1)) {
          internal.index = 1;
        } else if (internal.index <= 0) {
          internal.index = internal.eli.length;
        }
        internal.eul.css({'left' : (internal.index * internal.directionNum) * internal.removing});


        // 處理按鈕懸浮方式
        $(internal.btnPrev).hide();
        $(internal.btnNext).hide();
        if (is_string(external.next) && is_string(external.prev)) {
          if (is_false(external.hideNextPrev)) {
            $(internal.btnPrev).show();
            $(internal.btnNext).show();
          }
        } else {
          if (!is_true(external.hideNextPrev)) {
            internal.ele.append('<span class="pf_next">&gt;</span><span class="pf_prev">&lt;</span>');
            if (external.hideNextPrev == 'hover') {
              $(internal.btnPrev).hide();
              $(internal.btnNext).hide();
            }
          }          
        }

        // 上一个
        $(internal.btnPrev).click(function () {
            clearInterval(internal.timer);
            fun._clickMove('prev'); 
        });

        // 下一个
        $(internal.btnNext).click(function () {
            clearInterval(internal.timer);
            fun._clickMove('next');
        });

        // 前后按钮显示与隐藏
        internal.ele.on({
          mouseenter : function () {
            if (external.hideNextPrev == 'hover') {
              $(internal.btnNext).show() ;
              $(internal.btnPrev).show() ;              
            }
            if (is_true(external.hoverStop)) {
              clearInterval(internal.timer);
              internal.ifHoverOut = true ;
            }
          } , 
          mouseleave : function () {
            if (external.hideNextPrev == 'hover') {
              $(internal.btnNext).hide() ;
              $(internal.btnPrev).hide() ;              
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
        if (internal.nowIndex >= internal.eli.length ) {
          internal.nowIndex %= internal.eli.length ;
        } else if (internal.nowIndex < 0) {
          internal.nowIndex += internal.eli.length ;
        } 
        if (internal.nextIndex >= internal.eli.length) {
          internal.nextIndex %= internal.eli.length ;
        } else if (internal.nextIndex < 0) {
          internal.nextIndex += internal.eli.length ;
        } 

        // 運動
        internal.eul.stop().animate({
          'left' : (internal.index * internal.directionNum) * internal.removing
        },internal.duration , internal.easing).queue(function (next) {

          if (internal.index == (internal.eli.length + 1)) {
            internal.index = 1;
          } else if (internal.index == 0) {
            internal.index = internal.eli.length;
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

    };

    // 指定按鈕
    if (is_string(external.next)) {
      internal.btnNext = external.next;
    }
    if (is_string(external.prev)) {
      internal.btnPrev = external.prev;
    }

    fun._init();

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
    showIndex : 0 ,         /*默认显示的第一张图片*/
    direction : 'left',     /*无缝滚动的方向*/
    next : '' ,
    prev : '' ,
    auto : true ,           /*开启自动滚动*/
    hideNextPrev : false ,  /*隐藏按钮 'hover'为悬浮出现 'true'为不出现 'false'为出现 */
    hoverStop : false ,     /*悬浮停止运动*/
    scroll : {
      interval : 2000 ,
      duration : 500 ,
      easing : 'linear' ,
    } ,
    after : $.noop 
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