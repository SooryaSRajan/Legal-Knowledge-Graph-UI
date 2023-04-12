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
    <QueryWidget @change="(query) => this.query = query"/>
    {{query}}
  </div>
</template>

<script>
import QueryWidget from "@/components/QueryWidget";
export default {
  name: "QueriesView",
  components: {QueryWidget},
  mounted() {

  },
  data (){
    return {
      query: [],
    }
  },
  methods: {

  }
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
  margin-bottom: 20px;
}

</style>