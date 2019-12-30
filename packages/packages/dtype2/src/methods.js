import _ from 'sanctuary-def';
import S from 'sanctuary';
import dT from './dt';

function getLocal(vObj, ndxs, temp){
  if (ndxs.length === 0) return temp
  return getLocal(vObj, ndxs.slice(1), vObj.value[ndxs[0]])
}

dT.t.getFn = function(fnName, type) {
  if (type.substring(0,4) == "enum") {
    return dT.enums.controls[fnName]
  }
  return dT.controls[type][fnName]
}

dT.t.apply = function(typed, fnName, folder, options) {
  console.log("apply", typed, fnName, folder, options)
  let name
  if (!typed.name) {
    typed.name = "."
  }
  let type =typed.type
  let value = typed.value
  let temp = {}
  let ndx = 0
  let fn,  ans=[],out={value:[],type:[]}
  if (!(typeof type == "string")) {
    if (value instanceof Array)
      if (value.length !== Object.keys(type).length) {
        return false
      }
    if (dT.controls.tuple[fnName]) {
      console.log('apply tuple options', fnName, options);
      folder = dT.controls.tuple[fnName](typed, folder, options)
    }
    Object.keys(type).forEach((i, nndx) => {
      const onChangeSub = typedSub => {
        console.log('onChangeSub tuple', nndx, i, typedSub);
        if (options.onChange) {
          console.log('---', JSON.stringify(typed.type), JSON.stringify(type));
          typed.value[nndx] = typedSub.value;
          const typecpy = JSON.parse(JSON.stringify(typed.type));
          typecpy[i] = typedSub.type;
          console.log('onChangeSub tuple typed', typecpy, JSON.stringify(typecpy), typed, typed.type, type);
          options.onChange(Object.assign({}, typed, {type: typecpy}));
        }
      }
      const optionscpy = Object.assign({}, options, {onChange: onChangeSub});
      temp = {}
      temp.value = value[ndx]
      temp.type = type[i]
      temp.name = i
      console.log('apply tuple item options', fnName, optionscpy);
      ans[i] = dT.t.apply(temp, fnName, folder, optionscpy)
      out.value[ndx]=ans[i].value
      out.type[i]=ans[i].type
      ndx++
    });
    return out;
  }

  let arrT = dT.t.getArrayType({type:type})
  console.log(arrT)
  if (arrT) {
    ans = []
    if (dT.controls.array[fnName]) {
      folder = dT.controls.array[fnName](typed, folder, options)
    }

    value.forEach((val, i) => {
      const onChangeSub = (typedSub) => {
        if (options.onChange) {
          if (!typedSub) {
            typed.value.splice(i, 1);
            options.onChange(typed);
          } else {
            typed.value[i] = typedSub.value;
            options.onChange(typed);
          }
        }
      }
      const optionscpy = Object.assign({}, options, {onChange: onChangeSub});

      const addArrayElem = (ind) => {
        // const ind = i+1;
        typed.value.splice(ind, 0, null);
        options.onChange(typed);
        options.onReinitialize();
        // dT.t.apply({value:value[ind], type:arrT, name: typed.name+ind+ind}, fnName, folder, optionscpy);
      }
      optionscpy.arrOptions = {
        add: addArrayElem,
        remove: () => {},
        index: i,
      }

      ans[i] = dT.t.apply({value:value[i], type:arrT, name: typed.name+i}, fnName, folder, optionscpy)

      out.value.push(ans[i].value)
    });
    out.type = ans[0].type+"[]"
    return out;
  }

  let compT = dT.t.getComposite(typed.type)
  if (compT) {
    const onChangeSub = (typedSub) => {
      console.log('onChangeSub composite', typedSub);
      if (options.onChange) {
        options.onChange(typedSub);
      }
    }
    const optionscpy = Object.assign({}, options, {onChange: onChangeSub});

    return dT.t.apply({value:value, type: compT, name: typed.name}, fnName, folder, optionscpy)
  }

  const onChangeSub = (typedSub) => {
    console.log('onChangeSub simple', typedSub);
    if (options.onChange) {
      options.onChange(typedSub);
    }
  }
  const optionscpy = Object.assign({}, options, {onChange: onChangeSub});

  let a = dT.t.getFn(fnName, type)(typed, folder, optionscpy)
  return a
}

dT.t.setType = function (name, test, supertypes= []){
  dT[name] = _.NullaryType
  (name)
  (dT.settings.refURL+name)
  (supertypes)
  (test)
  if (!(dT.enum_choices.types[name]))
    dT.enum_choices.types = dT.enum_choices.types.concat([name])
  dT.enums.types = _.EnumType
    ("types")
    (dT.settings.refURL+"types")
    (dT.enum_choices.types);
  return dT[name]
}

dT.t.setComposite = function (name, tuple){
  dT.composites[name] = tuple
  dT.controls[name] = dT.controls["tuple"]
  if (!(dT.enum_choices.types[name]))
    dT.enum_choices.types = dT.enum_choices.types.concat([name])
  dT.enums.types = _.EnumType
    ("types")
    (dT.settings.refURL+"types")
    (dT.enum_choices.types);
  return dT[name]
}

dT.t.getComposite = function (name){
  return dT.composites[name]
}


dT.t.setEnum = function (name, choices){
  dT.enums[name] = _.EnumType
    (name)
    (dT.settings.refURL+name)
    (choices);
  dT.enum_choices[name]=choices;
  if (!(dT.enum_choices.types["enum:"+name]))
    dT.enum_choices.types = dT.enum_choices.types.concat(["enum:"+name])
  dT.enums.types = _.EnumType
    ("types")
    (dT.settings.refURL+"types")
    (dT.enum_choices.types);
  return dT.enums[name]
}

dT.t.bnType  = function (name, min, max){
  let test = x => x.gte(min) &&
      x.lte(max)
  let supertypes = [dT["bn"]]
  dT.controls[name] = Object.assign({},dT.controls["bn"])
  dT.controls[name].min(min)
  dT.controls[name].max(max)
  return dT.t.setType(name, test, supertypes)

}

dT.t.bbnType  = function (name, min, max){
  let test = x => x.gte(min) &&
      x.lte(max)
  let supertypes = [dT["bn"]]
  dT.controls[name] = Object.assign({},dT.controls["bn"],dT.controls["bbn"])
  dT.controls[name].min(min)
  dT.controls[name].max(max)
  return dT.t.setType(name, test, supertypes)

}

dT.t.byteType  = function (name, len){
  const re = `0x[a-fA-F0-9]{${len*2}}`
  let reg = RegExp(`(?:^${re}$)`)
  let test = x => reg.test(x)
  let supertypes = [dT["string"]]
  dT.controls[name] = {
    min: function(min){if (min) this._min = min; return this._min;},
    max: function(max){if (max) this._max = max; return this._max;},
    random: function(){ return {value: "0x"+("00".repeat(len).replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})), type:name}},
  }
  dT.controls[name] = Object.assign({}, dT.controls["string"], dT.controls[name])
  dT.controls[name].min("0x"+"00".repeat(len*2))
  dT.controls[name].max("0x"+"ff".repeat(len*2))
  return dT.t.setType(name, test, supertypes)
}

dT.t.getType = function(typed){
  let type = typed.type
  if (type.substring(0,4) == "enum") {
    return dT.enums[type.substring(5)]
  }
  if (type.substring(type.length-2) == "[]") {
    return _.Array (dT.t.getType({value: null, type: type.substring(0, type.length-2)}))
  }
  return dT[type];
}

dT.t.getArrayType = function(typed){
  let type = typed.type
  if (type.substring(type.length-2) == "[]")
     return type.substring(0,type.length-2);
  return false;
}

dT.t.getComponent = function(typed, key){
  let type = typed.type
  let value = typed.value
  if (type === "tuple") return value[key]
  let arrT = dT.t.getArrayType(typed)
  if (arrT) {
    return {value: value[key], type: arrT, name: typed.name+key}
  }
}


dT.t.getRange = function(typed){
  let type = typed.type, min,  max
  if (type.substring(0,4) == "enum") {
    min = new dT.BN(0)
    max = new dT.BN(dT.enum_choices[type.substring(5)].length-1)
  } else  {
    min = dT.controls[type].min()
    max = dT.controls[type].max()
  }
  return {min: min, max: max}
}

export default dT;
