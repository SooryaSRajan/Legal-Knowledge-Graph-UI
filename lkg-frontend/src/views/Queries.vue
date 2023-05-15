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
    <div id="tab-wrapper">
      <div id="choice-tab">
        <button class="tab-choice" :class="activeTab === 0 ? 'active' : ''" @click="onTabChange(0)">Search for Value
        </button>
        <button class="tab-choice" :class="activeTab === 1 ? 'active' : ''" @click="onTabChange(1)">Search for Similar
          Results
        </button>
      </div>
      <SimilarTypeQueryWidget v-if="activeTab === 0" :on-submit="onSubmit"
                              @tight-check-changed="tightCheckDisabled = !$event"/>
      <SimilarResultQueryWidget v-else-if="activeTab === 1" :on-submit="onSubmit"/>
    </div>
    <div class="spinner-position">
      <SpinnerWidget v-if="loading"/>
    </div>
    <SearchResults v-if="!loading" :documents="documents" :search-not-found="searchNotFound"
                   :tight-check-disabled="tightCheckDisabled" :search-result="true"/>
    <SearchResults v-if="!loading" :documents="similarDocuments" :search-not-found="false"
                   :tight-check-disabled="false" :search-result="false"/>
  </div>
</template>

<script>
import SimilarTypeQueryWidget from "@/components/SimilarTypeQueryWidget";
import SearchResults from "@/components/SearchResults";
import SpinnerWidget from "@/components/Spinner";
import SimilarResultQueryWidget from "@/components/SimilarResultQueryWidget";

export default {
  //TODO: Update no results found page according to the new design
  name: "QueriesView",
  components: {SimilarResultQueryWidget, SpinnerWidget, SimilarTypeQueryWidget, SearchResults},
  data() {
    return {
      query: [],
      documents: [],
      similarDocuments: [],
      loading: false,
      searchNotFound: false,
      tightCheckDisabled: false,
      activeTab: 0
    }
  },
  methods: {
    onTabChange(index) {
      this.activeTab = index
    },
    onSubmit(query, searchPath) {
      this.query = query
      this.loading = true
      fetch(`/query/${searchPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
      })
          .then(response => {
            this.loading = false
            return response.json()
          })
          .then(data => {
            console.log(data)
            this.searchNotFound = data.cases.length === 0;
            this.documents = data.cases
            this.similarDocuments = data.similarCases
          })
    },
  },
  watch: {
    activeTab() {
      this.searchNotFound = false
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
  margin-bottom: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

#choice-tab {
  display: flex;
  flex-direction: row;
  margin-left: 10px;
}

.tab-choice {
  padding: 15px;
  border: none;
  background-color: #7b8691;
  color: #d6dee8;
  font-size: 1rem;
  z-index: 100;
  transition: all 0.2s ease-in-out;
  margin: 0 0 0 2px;
  box-shadow: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.tab-choice:hover {
  background-color: #f5f5f5;
  color: #2c3e50;
  cursor: pointer;
}

.active {
  background-color: white;
  color: #2c3e50;
}

#tab-wrapper {
  width: 100%;
  background-color: #2c3e50;
  border-radius: 10px;
  padding-top: 10px;
}

</style>