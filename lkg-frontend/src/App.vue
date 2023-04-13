<template>
  <div class="app-root">
    <NavBar/>
    <router-view />
  </div>
</template>

<script>

import NavBar from "@/components/NavBar";
export default {
  name: 'App',
  components: {NavBar}
}
</script>

<style>
div {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.app-root{
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
body{
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}
</style>
