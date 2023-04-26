<template>
  <div v-if="documents.length !== 0" class="search">
    <h1>
      {{searchResult ? `Search Results (${documents.length})` : `Similar Results (${documents.length})`}}
    </h1>
    <div class="result-card" v-for="(document, index) in documents" :key="index">
      <h3>
        {{ document.name }}
      </h3>
      <div class="text" :class="document.showMore ? 'text-show-more' : 'text-show-less'">
        {{ document.document }}
      </div>
      <button class="show-more" @click="document.showMore = !document.showMore">
        {{ document.showMore ? "Show Less" : "Show More" }}
      </button>
    </div>
  </div>
  <div v-else-if="searchNotFound && searchResult" class="center-not-found-text">
    No results found :/
    <br/>
    Try optimising your search parameters<span v-if="!tightCheckDisabled"> or disable <span class="tight-check-hint">Tight Check</span> for a more extensive search</span>.
  </div>
</template>

<script>
export default {
  name: "SearchResults",
  props: {
    documents: {
      type: Array,
      required: true,
    },

    searchResult: {
      type: Boolean,
      required: false,
      default: false
    },
    searchNotFound: {
      type: Boolean,
      required: true,
      default: false
    },
    tightCheckDisabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },
}
</script>

<style scoped>
.search {
  padding-bottom: 50px;
  max-width: 100%;
}

.tight-check-hint{
  color: #4e88c7;
  font-weight: 600;
}

.center-not-found-text{
  text-align: center;
  width: 100%;
}

.result-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  padding: 20px;
  border-radius: 5px;
  margin-top: 20px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
}

h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.text {
  margin-top: 10px;
  font-size: 1rem;
  max-width: 100%;
  transition: ease-in-out 0.5s;
  text-align: justify;
}

.text-show-more {
  max-lines: none;
  text-overflow: unset;
  overflow: visible;
  max-height: none;
}

.text-show-less {
  max-height: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-lines: 3;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.show-more {
  margin-top: 20px;
  align-self: end;
  font-size: 1rem;
  padding: 10px;
  background-color: #2c3e50;
  border: none;
  font-weight: 600;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.show-more:hover {
  background-color: #34495e;
  transform: scale(1.1, 1.1);
}
</style>