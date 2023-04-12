<template>
  <div id="nav-bar">
    <div class="logo">
      LDAKG
    </div>
    <div class="right-elements">
      <router-link to="/" class="nav-element" exact>Query</router-link>
      <router-link to="/Visualization" class="nav-element">Visualize</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavBar"
}
</script>

<style scoped>
#nav-bar {
  background-color: #2c3e50;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  color: white;
}

.logo {
  font-family: monospace;
  font-size: 1.5rem
}

.right-elements {
  align-self: end;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-element {
  margin-left: 10px;
  padding: 5px;
  border-radius: 5px;
  text-decoration: none;
  color: #9ba9b9;
  transition: all 0.2s ease-in-out;
}

.nav-element:hover {
  background-color: #34495e;
  color: white;
  transform: scale(1.1, 1.1 );
}

.nav-element.router-link-active,
.nav-element.router-link-exact-active {
  background-color: #34495e;
  color: white;
}


</style>