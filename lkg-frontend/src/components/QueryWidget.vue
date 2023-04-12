<template>
  <div class="query-root">
    <div class="query-widget-row" v-for="(q, index) in query" :key="index">
      <select class="query-type" v-model="q.type" @change="handleChange">
        <option v-for="(type) in types" :value="type" :key="type">{{ type }}</option>
      </select>
      <input class="query-value" type="text" placeholder="Enter value" v-model="q.value" @change="handleChange">
      <button class="query-add-remove" @click="handleClick(index)"
              :style="{transform: q.added ? 'rotate(45deg)' : 'rotate(0deg)'}">
        <svg enable-background="new 0 0 50 50" height="50px" id="Layer_1" version="1.1" viewBox="0 0 50 50" width="50px"
             xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="50" width="50"/>
          <line fill="none" stroke="#FFFFFF" stroke-miterlimit="10" stroke-width="4" x1="9" x2="41" y1="25" y2="25"/>
          <line fill="none" stroke="#FFFFFF" stroke-miterlimit="10" stroke-width="4" x1="25" x2="25" y1="9" y2="41"/>
      </svg>
      </button>
    </div>
    <div class="query-submit-row">
<!--      <button @click="andOr" class="query-and-or">Query Type{{ isAndQuery ? '(AND)' : ' (OR)' }}</button>-->
      <button @click="submit" class="query-submit">Submit</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "QueryWidget",
  mounted() {
    fetch('/query/types')
        .then(response => response.json())
        .then(data => this.types = data)
  },
  data() {
    return {
      types: [],
      query: [{
        type: "NONE",
        value: "",
        added: false
      }],
      isAndQuery: true
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
          added: false
        })
      }
      this.query.forEach((q, i) => {
        if (i !== this.query.length - 1) {
          q.added = true
        }
      })
      this.query[this.query.length - 1].added = false
    },
    handleChange() {
      this.$emit('change', this.query)
    },
    andOr() {
      this.isAndQuery = !this.isAndQuery
    },
    submit() {

    }
  },
}
</script>

<style scoped>
.query-root {
  background-color: #2c3e50;
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

.query-add-remove:hover {
  background-color: #34495e;
  transform: scale(1.1, 1.1);
}

.query-submit-row{
  display: flex;
  flex-direction: row;
}

.query-and-or {
  margin-top: 30px;
  font-size: 1rem;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 14px;
  background-color: white;
  border: none;
  transition: ease-in-out 0.2s;
}

.query-submit {
  margin-top: 30px;
  font-size: 1rem;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 14px;
  background-color: white;
  border: none;
  transition: ease-in-out 0.2s;
  flex: 1;
}

.query-submit:hover {
  background-color: #ecf6ff;
  cursor: pointer;
}

</style>