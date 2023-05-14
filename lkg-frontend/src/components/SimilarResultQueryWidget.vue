<template>
  <div class="query-root">
    <div class="query-widget-row">
      <select class="query-type" v-model="query.type">
        <option v-for="(type) in types" :value="type" :key="type">{{ type }}</option>
      </select>
      <input class="query-value" type="text" placeholder="Enter value"
             v-model="query.value"
             :class="query.error ? 'input-error' : ''"
             @input="onInputChanged(0)">
    </div>
    <div class="query-submit-row">
      <button class="query-reset" @click="handleReset">Reset</button>
      <button @click="handleSubmit" class="query-submit">Submit</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SimilarResultQueryWidget",
  mounted() {
    fetch('/query/types')
        .then(response => response.json())
        .then(data => this.types = data)
  },
  props: {
    onSubmit: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      types: [],
      query: {
        type: "NONE",
        value: "",
        added: false,
        error: false
      },
      tightSearch: true
    }
  },
  methods: {
    onInputChanged() {
      this.query.error = this.query.value === ""
    },
    handleReset() {
      this.query = {
        type: "NONE",
        value: "",
        added: false,
        error: false
      }
    },
    handleSubmit() {

      if(this.query.value === "") {
        this.query.error = true
        return
      }

      if (!this.query.error)
        this.onSubmit(this.query, 'searchForSimilarResults')
    },
  },
}
</script>

<style scoped>
.query-root {
  background-color: white;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  width: 100%;
  padding: 15px;
  border-radius: 10px;
}

.query-widget-row {
  display: flex;
  flex-direction: row;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  background-color: white;
  border-radius: 10px;
}

.query-widget-row:not(:first-child) {
  margin-top: 10px;
}

.query-type {
  border-radius: 5px;
  padding: 14px;
  font-size: 1rem;
  color: white;
  border: none;
  background-color: #2c3e50;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

.query-value {
  border-radius: 5px;
  padding: 14px;
  font-size: 1rem;
  border: 1px solid #2c3e50;
  background-color: #ecf6ff;
  margin-left: 10px;
  flex: 1;
}

.query-add-remove {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  padding: 14px;
  color: white;
  border: none;
  background-color: #2c3e50;
  margin-left: 10px;
  transition: ease-in-out 0.2s;
}

.query-reset {
  font-size: 1rem;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 14px;
  margin-right: 10px;
  background-color: #2c3e50;
  border: none;
  transition: ease-in-out 0.2s;
  color: white;
}

.query-submit-row {
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.query-submit {
  font-size: 1rem;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 14px;
  background-color: #2c3e50;
  border: none;
  transition: ease-in-out 0.2s;
  color: white;
  flex: 1;
}

</style>