<template>
  <div class="swiper-container" :style="{'width':imgWidth+'vw'}">
    <div
      class="photo-container"
      :style="{width: imgWidth*imgLength+'vw', 'margin-left': distance+'vw'}"
      v-move="{setTouchmove: setTouchmove, setTouchend: setTouchend}"
    >
      <img
        v-for="(item, index) in img"
        :src="item"
        :key="index"
        :style="{'width':imgWidth+'vw', 'height':imgHeight+'vh'}"
      />
    </div>
    <ul>
      <li
        v-for="index in imgLength"
        :key="index"
        :style="{'background':index-1==currentImg?'white':'gainsboro'}"
      ></li>
    </ul>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      img: [
        // 图片资源 网上随便找的
        'http://img.netbian.com/file/2019/0824/fe28123a86549be48bc00d639da77c60.jpg',
        'http://img.netbian.com/file/2019/1216/9cc8ee311939ec9bfcf9a30a7eb380bc.jpg',
        'http://img.netbian.com/file/2020/0214/1e7c0d6d4d943662e5b634e1400464a3.jpg',
        'http://img.netbian.com/file/2019/0414/3973632c2ca7ae26e346413d62c64970.jpg'
      ],
      imgWidth: 95, // 图片的宽度vw
      imgHeight: 25, // 图片的高度vh
      currentImg: 0, // 当前图片索引
      imgLength: 0, // 图片个数
      distance: 0, // 移动的距离
      time: '' // 定时器
    }
  },
  methods: {
    // 修改属性
    setTouchmove: function(move) {
      // 定时器存在则关闭
      if (this.time) {
        clearInterval(this.time)
        this.time = ''
        return
      }
      move = (move * 100) / document.body.clientWidth // 换算为vw
      if (move > 0 && this.distance - move >= -(this.imgLength - 1) * this.imgWidth - 2) {
        this.distance -= move
      } else if (move < 0 && this.distance - move <= 2) {
        this.distance -= move
      }
    },
    setTouchend: function(move) {
      if (move > 0 && this.currentImg + 1 < this.imgLength) this.currentImg++
      else if (move < 0 && this.currentImg - 1 >= 0) this.currentImg--
      this.distance = -this.currentImg * this.imgWidth
      // 重启定时器
      this.setTime()
    },
    // 设置定时器
    setTime: function() {
      this.time = setInterval(() => {
        this.currentImg++ // 当前图片的索引
        this.distance += -this.imgWidth // 移动的距离
        if (this.currentImg >= this.imgLength) {
          this.currentImg = 0
          this.distance = 0
        }
      }, 3000) // 默认间隔时间为3s
    }
  },
  directives: {
    // 实现拖拽的指令
    move: {
      bind: function(el, bindings) {
        let mouseDownX = 0
        let moveX = 0
        let flag = false
        el.addEventListener(
          'touchstart',
          function(e) {
            bindings.value.setTouchmove()
            // 鼠标按下时的鼠标所在的X坐标
            mouseDownX = e.touches[0].pageX
            // 表示鼠标已按下
            flag = true
          },
          false
        )
        el.addEventListener(
          'touchmove',
          function(e) {
            // 确保鼠标已按下
            if (flag) {
              moveX = mouseDownX - e.touches[0].pageX
              bindings.value.setTouchmove(moveX)
              mouseDownX = e.touches[0].pageX
            }
          },
          false
        )
        el.addEventListener(
          'touchend',
          function() {
            bindings.value.setTouchend(moveX)
            // 标识已松开鼠标
            flag = false
          },
          false
        )
      }
    }
  },
  mounted: function() {
    // 记录图片个数
    this.imgLength = this.img.length
    // 启动定时器
    this.setTime()
  }
}
</script>

<style scoped>
.swiper-container {
  position: relative;
  border-radius: 5px;
  margin: 1vh auto;
  overflow: hidden;
}
.photo-container {
  transition: all 1s;
}
.photo-container > img {
  float: left;
}
ul {
  display: flex;
  width: 10vw;
  justify-content: space-around;
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translate(-50%, 0);
}
li {
  list-style: none;
  width: 1vh;
  height: 1vh;
  border-radius: 50%;
}
</style>
