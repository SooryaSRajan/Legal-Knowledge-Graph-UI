<template>
  <div class="switch-root">
    <div class="switch-root-inner" @click="switchOnClick">
      <div class="switch-frame">
        <div class="switch-content" :style="{'transform': isAnd ? 'rotateX(0deg) translateY(0px)' : 'rotateX(90deg) translateY(-100%)'}">
            And
        </div>
        <div class="switch-content" :style="{'transform': !isAnd ? 'rotateX(0deg) translateY(-100%)' : 'rotateX(90deg) translateY(0px)'}">
          Or
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SpinSwitch",
  data() {
    return {
      isAnd: true
    }
  },
  methods: {
    switchOnClick() {
      this.isAnd = !this.isAnd
      this.$emit('switch', this.isAnd)
    }
  }
}
</script>

<style scoped>
.switch-root{
  width: 90px;
  height: 45px;
  background-color: #dae7f1;
  border-radius: 5px;
  box-shadow: rgba(183, 180, 180, 0.16) 0 3px 6px, rgba(213, 184, 184, 0.23) 0 3px 6px;
  padding: 5px;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.switch-root-inner{
  width: 100%;
  height: 100%;
  border-radius: 5px;
  box-shadow: inset rgba(183, 180, 180, 0.16) 0 3px 6px, inset rgba(213, 184, 184, 0.23) 0 3px 6px;
  padding: 2px;
  transition: all 0.4s ease-in-out;
  overflow: hidden;
  background-color: #1b2631;
}

.switch-frame{
  width: 100%;
  height: 100%;
  border-radius: 5px;
  transition: all 0.4s ease-in-out;
  overflow: hidden;
}

.switch-frame:hover{
  cursor: pointer;
}

.switch-content{
  border-radius: 5px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #2c3e50;
  color: whitesmoke;
  overflow: hidden;
  box-shadow: inset rgba(197, 218, 201, 0.5) 0 3px 6px, inset rgba(218, 193, 193, 0.23) 0 3px 6px;
}

</style>