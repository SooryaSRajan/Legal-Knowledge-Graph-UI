<template>
  <div class="query-root">
    <div class="query-widget-row" v-for="(q, index) in query" :key="index">
      <select class="query-type" v-model="q.type">
        <option v-for="(type) in types" :value="type" :key="type">{{ type }}</option>
      </select>
      <input class="query-value" type="text" placeholder="Enter value" v-model="q.value"
             :class="q.error ? 'input-error' : ''" @input="onInputChanged(index)">
      <button class="query-add-remove" @click="handleClick(index)"
              :style="{transform: q.added ? 'rotate(45deg)' : 'rotate(0deg)'}">
        <svg height="50px" id="Layer_1" viewBox="0 0 50 50" width="50px"
             xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="50" width="50"/>
          <line fill="none" stroke="#FFFFFF" stroke-miterlimit="10" stroke-width="4" x1="9" x2="41" y1="25" y2="25"/>
          <line fill="none" stroke="#FFFFFF" stroke-miterlimit="10" stroke-width="4" x1="25" x2="25" y1="9" y2="41"/>
      </svg>
      </button>
    </div>
    <div class="query-tight-check-wrapper">
      <div>
        Tight Check
      </div>
      <div class="query-tight-tool-tip">
        Enabling tight checking will force the query engine to get documents that match all the conditions.
      </div>
      <label class="switch">
        <input type="checkbox" v-model="tightSearch" @change="$emit('tightCheckChanged', tightSearch)">
        <span class="slider"></span>
      </label>
    </div>
    <div class="query-submit-row">
      <button class="query-reset" @click="handleReset">Reset</button>
      <button @click="handleSubmit" class="query-submit">Submit</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SimilarTypeQueryWidget",
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
      query: [{
        type: "NONE",
        value: "",
        added: false
      }],
      tightSearch: true
    }
  },
  methods: {
    handleClick(index) {
      if (this.query[index].added) {
        this.query.splice(index, 1)
      } else {
        this.query.push({
          type: "NONE",
          value: "",
          added: false,
          error: false
        })
      }
      this.query.forEach((q, i) => {
        if (i !== this.query.length - 1) {
          q.added = true
        }
      })
      this.query[this.query.length - 1].added = false
    },
    onInputChanged(index) {
      this.query[index].error = this.query[index].value === ""
    },
    handleReset() {
      this.query = [{
        type: "NONE",
        value: "",
        added: false
      }]
    },
    handleSubmit() {
      let errors = false
      this.query.map(q => {
        q.error = q.value.trim() === "";
        errors = errors || q.error
      })

      if (!errors)
        this.onSubmit({
          query: this.query,
          tightSearch: this.tightSearch
        }, 'searchForValues')
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

.input-error {
  border: 1px solid red;
  background-color: #ffcccc;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-top: 10px;
}

.switch input {display:none;}

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
  box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
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

.query-add-remove:hover, .query-reset:hover, .query-submit:hover {
  background-color: #34495e;
  transform: scale(1.01, 1.01);
  cursor: pointer;
}

.query-tight-check-wrapper{
  margin-left: 4px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
}

.query-tight-tool-tip{
  margin-top: 4px;
  text-align: start;
  font-size: 12px;
  color: #7b8691;
}

</style>