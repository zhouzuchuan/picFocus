# picFocus


* 版本：v1.0.0

* 兼容性 ： IE6+/FF/Chrome... 

* 版本 ：

  * v1.0.0 【2015.05.18】






* 注：
 * 为了避免出现错误，该版本引用jquery库请选择1.7版本以上
 * 插件框架用的是ul标签搭建，里面尽可能不要用ul和li标签



## 一 、 整体框架

  &lt;div class="pf"&gt;

    <ul>

      <li><img src="" title="标题一" /></li>

      <li><img src="" title="标题二" /></li>

      <li><img src="" title="标题三" /></li>

      <li><img src="" title="标题四" /></li>

    </ul>

  &lt;/div&gt;


## 二 、 调用方法（根据具体需求选择调用）

  $('.pf').picFocus({
    showIndex : 0 ,
    direction : 'left',
    width : 'auto' ,
    height : 'auto' ,
    next : '' ,
    prev : '' ,
    auto : true ,
    hideNextPrev : false ,
    hoverStop : false ,
    loading : {
      show : true ,
      text : '' ,
      loadingImgSrc : ''
    },
    scroll : {
      interval : 2000 ,
      duration : 500 ,
      easing : 'linear'
    } ,
    thumb : {
      show : false ,
      status : 'point' ,
      style : {} ,
      showSize : 5
    } ,
    txt : {
      show : false
    },
    after : $.noop
  });



## 三 、 API :


<em>可选（number），第一次加载显示第几张图片，默认为 0</em>

### showIndex : 0

=================================

<em>可选（string），无缝滚动方向，默认为 left</em>

### direction : left

=================================

<em>必选（number），焦点图宽度</em>

### width : 1200

=================================

<em>必选（number），焦点图高度</em>

### height : 1200

=================================

<em>可选（class/ID），自定义指定下一个按钮类 </em>

### next : ''

=================================

<em>可选（class/ID），自定义指定上一个按钮类 </em>

### prev : ''

=================================

<em>可选（true/false），自动滚动 默认为true</em>

### auto : 10

=================================

<em>可选（true/false/string），隐藏按钮 'hover'为悬浮出现 'true'为不出现 'false'为出现，默认为 true </em>

### hideNextPrev : true

=================================

<em>可选（true/false），悬浮停止运动，默认为 true </em>

### hoverStop : true

=================================

<em>加载样式</em>

### loading : {

  <em>可选（true/false），是否开启 默认为 true </em>

  <strong>show : true  </strong>

  =================================

  <em>可选（string/false），加载等待动画路径 如果为false则不显示图片 </em>

  <strong>text : ''  </strong>

  =================================

  <em>可选（string），加载提示文字 </em>

  <strong>text : ''  </strong>

### }

=================================

<em>缩略图</em>

### thumb : {

  <em>可选（true/false），是否开启 默认为 false </em>

  <strong>show : false  </strong>

  =================================

  <em>可选（string），缩略图状态（'picture'图片  'point'点） 默认为 picture </em>

  <strong>status : 'picture'  </strong>

  =================================

  <em>可选（object），自定义样式（只是在li标签上） </em>

  <strong>style : {}  </strong>

  =================================

  <em>可选（number），缩略图显示个数 </em>

  <strong>showSize : ''  </strong>

### }

=================================

<em>滚动</em>

### scroll : {

  <em>可选（number），滚动切换间隔时间 </em>

  <strong>interval : false  </strong>

  =================================

  <em>可选（string），滚动运行时间 </em>

  <strong>duration : 'picture'  </strong>

  =================================

  <em>可选（string），滚动方式 </em>

  <strong>easing : ''  </strong>

### }

=================================

<em>提示文字</em>

### txt : {

  <em>可选（true/false），是否开启 默认为 false </em>

  <strong>show : true  </strong>

### }

=================================

<em>可选，切换之后执行的函数内部有两个参数（nowIndex , nextIndex）自动切换下 (现在显示的下标 , 下一个显示的下标)</em>

### after : $.noop

