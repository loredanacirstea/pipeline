/* eslint-disable */

import { ethers } from 'ethers';

export const getItemsFromMd = (text) => {
  const included = {aliases: [], full: []};
  const links = {aliases: [], full: []};
  const arrayMatch = [...text.matchAll(/\[\[(.*?)\]\]/g)];

  arrayMatch.forEach((match) => {
    const endindex = match.index + match[0].length;
    if (text.substring(endindex, endindex + 2) === '()') {
      links.aliases.push(match[1]);
      links.full.push(`${match[0]}()`);
    } else {
      included.aliases.push(match[1]);
      included.full.push(match[0]);
    }
  });
  return {included, links};
};


const SLOT_SIZE_MULTI = {
  tuple: true,
  string: true,
  bytes: true,
}


export const getSizeSlotBools = (types) => {
  return types.map((type) => {
    if (SLOT_SIZE_MULTI[type.type]) return false;
    if (type.type.slice(-1) == ']') return false;
    return true;
  });
};


export const buildinterpreterArgs = (graphObj, stepsAbi, graphAbi) => {
  console.log('buildinterpreterArgs', graphObj, stepsAbi, graphAbi);
  const allArgs = [];
  const allInputs = [];
  let isTransaction = false;

  graphObj.forEach((graph, i) => {
    const stepskey = [], portkey = [];
    const args = {
      inputs: '',
      inputSizeIsSlot: [false].concat(getSizeSlotBools(graphAbi[i].inputs)),
      starts: [0],
      steps: [],
      outputIndexes: [],
    };
    const inputs = {};
    let inputLen = 0;

    Object.keys(graph.n).forEach((key) => {
      key = parseInt(key);
      if (key < 2000) {
        stepskey.push(key);
      } else {
        portkey.push(key);
      }
    });

    graphAbi[i].inputs.forEach((_, i) => {
      inputs[`${portkey[i]}o${0}`] = i + 1;
    });
    inputLen = graphAbi[i].inputs.length + 1;

    allInputs[i] = [[], []]
    allInputs[i][0] = graphAbi[i].inputs.map(inp => {
      inp.functionName = graphAbi[i].name;
      return inp;
    });
    console.log('stepskey', stepskey);
    console.log('portkey', portkey);
    stepskey.forEach((key, j) => {
      const step = graph.n[key];

      stepsAbi[step.id].abi.outputs.forEach((_, i) => {
        inputs[`${j}o${i}`] = inputLen + i;
      });
      inputLen += stepsAbi[step.id].abi.outputs.length;

      const istep = {
        contractAddress: stepsAbi[step.id].deployment,
        functionSig: ethers.utils.id(stepsAbi[step.id].signature).slice(0, 10),
        inputIndexes: stepsAbi[step.id].abi.inputs.map(() => 0),
        valueIndex: stepsAbi[step.id].abi.payable ? 1 : 0,
        outputSizeIsSlot: getSizeSlotBools(stepsAbi[step.id].abi.outputs),
      }

      args.steps.push(istep);
      allInputs[i][1] = allInputs[i][1].concat(stepsAbi[step.id].abi.inputs.map((inp) => {
        inp.functionName = stepsAbi[step.id].abi.name;
        inp.contractName = stepsAbi[step.id].contractName;
        return inp;
      }));
      allInputs[i][1] = allInputs[i][1].concat(stepsAbi[step.id].abi.outputs.map((out) => {
        out.functionName = stepsAbi[step.id].abi.name;
        out.contractName = stepsAbi[step.id].contractName;
        return out;
      }));
      if (!stepsAbi[step.id].abi.constant) {
        isTransaction = true;
      }
    });

    // graph.e[i] = [step_i, output_i+1, step_i, input_i+1]
    graph.e.forEach((edge, i) => {
      const stepOut_i = parseInt(edge[0]);
      const stepOutArg_i = parseInt(edge[1]);
      const stepIn_i = parseInt(edge[2]);
      const stepInArg_i = parseInt(edge[3]);
      const inputIndex = inputs[`${stepOut_i}o${stepOutArg_i - 1}`];

      if (!args.steps[stepIn_i]) {
        args.outputIndexes.push(inputIndex);
        return;
      }
      if (
        args.steps[stepIn_i].valueIndex > 0
        && stepInArg_i == args.steps[stepIn_i].inputIndexes.length
      ) {
        // wei_value
        args.steps[stepIn_i].valueIndex = inputIndex;
        args.steps[stepIn_i].inputIndexes.pop();
      } else {
        args.steps[stepIn_i].inputIndexes[stepInArg_i - 1] = inputIndex;
      }
    });

    allArgs.push(args);
  });

  return {allArgs, allInputs, isTransaction};
};

const cumulativeSum = (sum => value => sum += value)(0);

export const buildinterpreterInputs = (inputs) => {
  let encodedInputs = '';
  let starts = [0];
  inputs.map((input, i) => {
    const encodedValue = ethers.utils.defaultAbiCoder.encode([input.type], [input.value]);

    starts.push((encodedValue.length - 2) / 2);
    encodedInputs += encodedValue.slice(2);
  });
  starts = [0].concat(starts.map(cumulativeSum));
  return {inputs: `0x${encodedInputs}`, starts};
}
