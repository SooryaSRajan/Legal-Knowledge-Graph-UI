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
    <QueryWidget :on-submit="onSubmit" @tight-check-changed="tightCheckDisabled = !$event"/>
    <div class="spinner-position">
      <SpinnerWidget v-if="loading"/>
    </div>
    <SearchResults v-if="!loading" :documents="documents" :search-not-found="searchNotFound"
                   :tight-check-disabled="tightCheckDisabled"/>
  </div>
</template>

<script>
import QueryWidget from "@/components/QueryWidget";
import SearchResults from "@/components/SearchResults";
import SpinnerWidget from "@/components/Spinner";

export default {
  name: "QueriesView",
  components: {SpinnerWidget, QueryWidget, SearchResults},
  data() {
    return {
      query: [],
      documents: [],
      loading: false,
      searchNotFound: false,
      tightCheckDisabled: false
    }
  },
  methods: {
    onSubmit(query) {
      this.query = query
      this.loading = true
      fetch('/query/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
      })
          .then(response => response.json())
          .then(data => this.documents = data
          )
    }
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


.spinner-position {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

</style>