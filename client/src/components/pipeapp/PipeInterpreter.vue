<template>
  <v-layout row wrap>
    <v-flex xs12 v-if="!isTransaction" v-for="(inputAbis, i) in allInputs">
      <v-combobox
        :items="inputAbis"
        :search-input.sync="search"
        hide-selected
        item-text="computedName"
        item-value="index"
        hint="Maximum of 5 tags"
        label="Add some tags"
        multiple
        persistent-hint
        small-chips
        @change="updateOutputs($event, i)"
      >
        <template v-slot:no-data>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>
                No results matching "<strong>{{ search }}</strong>". Press <kbd>enter</kbd> to create a new one
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-combobox>
    </v-flex>
    <v-flex xs12>
      <AbiFunction
          v-if="graphsAbi.length"
          v-for="(funcAbi, i) in graphsAbi"
          :key="`function_${i}`"
          :abi="funcAbi"
          @change="runInterpreter($event, i)"
      />
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */

import {AbiFunction} from 'vue-ethabi';
import {buildinterpreterInputs} from './utils';

export default {
  props: ['graphsAbi', 'interpreterJson', 'interpreterData', 'interpreterContract'],
  components: {AbiFunction},
  data() {
    return {
      newInterpreterJson: [],
      search: null
    };
  },
  computed: {
    allInputs() {
      console.log(this.graphsAbi, this.interpreterData);
      this.newInterpreterJson = JSON.parse(JSON.stringify(this.interpreterJson));
      return this.interpreterData.allInputs.map((inputAbis) => {
        const index = inputAbis[0].length;
        return inputAbis[1].map((abi, i) => {
          abi.index = index + i;
          abi.computedName = `${abi.contractName} - ${abi.functionName} - ${abi.name}`;
          return abi;
        });
      })
    },
    isTransaction() {
      return this.interpreterData.isTransaction;
    }
  },
  methods: {
    updateOutputs(outputs, i) {
      this.newInterpreterJson[i].outputIndexes = outputs;
    },
    runInterpreter(inputs, index) {
      const interpreterInputs = buildinterpreterInputs(inputs);
      this.newInterpreterJson[index].inputs = interpreterInputs.inputs;
      this.newInterpreterJson[index].starts = interpreterInputs.starts;
      this.runInterpreterContract(this.newInterpreterJson[index], index);
    },
    async runInterpreterContract(interpreterArgs, index) {
        console.log('runInterpreter', interpreterArgs);
        console.log('this.interpreterContract', this.interpreterContract);
        let result;
        try {
          result = await this.interpreterContract.run(interpreterArgs, {value: 100});
        } catch (e) {
          result = e;
        }
        console.log('result', result);

        let element = document.getElementById(`output_${this.graphsAbi[index].name}`);
        element.innerHTML = '';

        Object.keys(result).forEach((name) => {
            let value = result[name];
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            element.insertAdjacentHTML('beforeend', `<p>${name}: ${value}</p>`);
        });
    },
  },
};
</script>
