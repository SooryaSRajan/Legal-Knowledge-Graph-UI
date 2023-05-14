<template>
  <div class="root">
    <h1>
      Visualization
    </h1>
    <div class="sub-text">
      The visualization page lets you visualize basic bar graphs of frequency of a particular category. Currently we
      also offer to let the user pick the range of matching words from a value 0.5 - 1, one being words with a perfect
      match and 0.5 being words with a partial match. This lets the user pick the accuracy of the result according to
      his needs. We also let the user choose if frequency of entities of the same nodes can be included or not.
    </div>
    <div class="options-box">
      <select class="query-type" v-model="type">
        <option v-for="(type) in typesClean" :value="type" :key="type">{{ type }}</option>
      </select>
      <div class="range-root">
        <div>
          Range
        </div>
        <div class="same-case-occurrence-tight-tool-tip" style="padding-bottom: 20px">
          A higher range will match less words with more accuracy and a lower range will match more words with less
          accuracy. The default value is 0.8.
        </div>
        <div class="range-container">
          <span class="ranger-label">0.50</span>
          <input type="range" min="0.5" max="1" class="rangeSlider" v-model="range" step="0.05">
          <span class="ranger-label">1.00</span>
        </div>
        <div class="current-range">
          <span class="current-range-label">
            Current range:
          </span> {{ range }}
        </div>
      </div>
      <div class="same-case-occurrence-check-wrapper">
        <div>
          Same Case Occurrence
        </div>
        <div class="same-case-occurrence-tight-tool-tip">
          Enabling same case occurrence will allow the query engine to also include count of occurrence of entities that
          is part of the same case cluster.
        </div>
        <label class="switch">
          <input type="checkbox" v-model="sameCaseOccurrence" @change="$emit('tightCheckChanged', sameCaseOccurrence)">
          <span class="slider"></span>
        </label>
      </div>
      <div class="query-submit-row">
        <button class="query-reset" @click="handleReset">Reset</button>
        <button @click="handleSubmit" class="query-submit">Submit</button>
      </div>
    </div>
    {{ response }}
  </div>
</template>

<script>
export default {
  name: "VisualizationView",
  mounted() {
    fetch('/query/types')
        .then(response => response.json())
        .then(data => this.types = data)
  },
  data() {
    return {
      types: [],
      type: "CASE_NUMBER",
      range: 0.8,
      sameCaseOccurrence: false,
      response: [],
      loading: false,
    }
  },
  methods: {
    handleSubmit() {
      let query = {
        type: this.type,
        matchRange: this.range,
        sameCaseOccurrence: this.sameCaseOccurrence
      }
      this.loading = true
      fetch(`/query/categoryStatistics`, {
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
            this.response = data
            console.log(data)
          })
          .catch(error => {
            this.loading = false
            console.log(error)
          })
    },
    handleReset() {
      this.type = "CASE_NUMBER"
      this.range = 0.8
      this.sameCaseOccurrence = false
    }
  },
  computed: {
    typesClean() {
      return this.types.filter(type => type !== "NONE" && type !== "DATE")
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

.options-box {
  background-color: white;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  margin-top: 30px;
  padding: 20px;
  border-radius: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
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

.range-root {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.range-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.ranger-label {
  font-size: 0.8rem;
  color: #2c3e50;
  font-weight: lighter;
}

.current-range {
  align-self: end;
  font-size: 0.9rem;
}

.current-range-label {
  font-weight: 500;
}

.rangeSlider {
  margin-left: 10px;
  margin-right: 10px;
  -webkit-appearance: none;
  height: 5px;
  flex: 1;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.rangeSlider:hover {
  opacity: 1;
}

.rangeSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: #2c3e50;
  border-radius: 50%;
  cursor: pointer;
}

.rangeSlider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  cursor: pointer;
  background: #2c3e50;
  border-radius: 50%;
}


.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-top: 10px;
}

.switch input {
  display: none;
}

.slider {
  border-radius: 5px;
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #a0afbb;
  -webkit-transition: .4s;
  transition: .4s;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

.slider:before {
  border-radius: 5px;
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2c3e50;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2c3e50;
}

input:checked + .slider:before {
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}


.same-case-occurrence-check-wrapper {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
}

.same-case-occurrence-tight-tool-tip {
  margin-top: 4px;
  text-align: start;
  font-size: 12px;
  color: #7b8691;
}

.query-submit-row {
  width: 100%;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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

.query-reset:hover, .query-submit:hover {
  background-color: #34495e;
  transform: scale(1.01, 1.01);
  cursor: pointer;
}

</style>