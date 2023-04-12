<template>
  <div class="root">
    <h1>
      Queries
    </h1>
    <div class="sub-text">
      Query anything through the query page, query the knowledge graph to get results about MVD cases, elements of
      context are organized in such a way that they bring maximum number of similar cases together. Choose type of
      element and enter the value you're looking for.
    </div>
  </div>
</template>

<script>
export default {
  name: "QueriesView",
  data (){
    return {
      query: [{
        type: "",
        value: ""
      }]
    }
  },
}
</script>

<style scoped>
.root {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: start;
  align-items: start;
  flex-direction: column;
  padding: 40px;
}

.sub-text {
  margin-top: 10px;
  font-size: 1rem;
  text-align: start;
}

</style>