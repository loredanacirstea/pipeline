import _ from 'sanctuary-def';
import S from 'sanctuary';
import dT from './methods';


dT["bn"] = _.NullaryType
  ("bn")
  (dT.settings.refURL+"bn")
  ([])
  (x => dT.BN.isBN(x))

dT.controls["bn"] = {
  min: function(min){if (min !== undefined) this._min = min; return this._min;},
  max: function(max){if (max !== undefined) this._max = max; return this._max;},
  random: function(typed){
    let type = typed.type
    let range = dT.t.getRange(typed)
    let val = range.max.sub(new dT.BN(Math.random()*Number.MAX_SAFE_INTEGER).mul(range.max.sub(range.min)).div(new dT.BN(Number.MAX_SAFE_INTEGER)))
    return ({value:  val, type: type})
  },
}

dT.controls["bbn"] = {}

dT["string"] = _.NullaryType
  ("string")
  (dT.settings.refURL+"string")
  ([])
  (x => typeof(x) === "string")

dT.controls["string"] = {
  random: function(typed){
    let val = (Math.random()+1).toString(36).substring(Math.random()*23);
    typed.value = val
    return typed
  },

}

dT.controls["natural"] = {
  min: function(min){if (min !== undefined) this._min = min; return this._min;},
  max: function(max){if (max !== undefined) this._max = max; return this._max;},
  random: function(typed){
    let type = typed.type
    let range = dT.t.getRange(typed)
    let val = range.max.sub(Math.random()*Number.MAX_SAFE_INTEGER * range.max.sub(range.min) / Number.MAX_SAFE_INTEGER)
    return ({value:  val, type: type})
  },
}


dT.enums.controls = {
  random: function(typed){
    let type = typed.type
    let range = dT.t.getRange(typed)
    let val = new dT.BN(Math.random()*Number.MAX_SAFE_INTEGER).mul(range.max.sub(range.min)).div(new dT.BN(Number.MAX_SAFE_INTEGER))
    val = val.toNumber()
    val = dT.enum_choices[type.substring(5)][val]
    typed.value = val
    return typed
  }
}

dT.controls.tuple = {
  random: function(value, type){
    let ndx = 0, temp, ans =[], out={value:[],type:{}}
    for (let i in type){
      temp = {}
      temp.value = value[ndx]
      temp.type = type[i]
      temp.name = i
      ans[i] = dT.t.apply(temp, "random")
      out.value[ndx]=ans[i].value
      out.type[i]=ans[i].type
      ndx++
    }
    return out
  }
}

dT.t.setComposite("type_component", { label:"string", "Component":"enum:types", "[x1]":"uint8", "[x2]":"uint8"})


dT.controls.array  = {
  random: (typed)=>{typed},
}


dT["tuple"] = _.Array (_.Unknown)
dT.t.setType("integer", x=> Math.floor(x) == x , [])
dT.t.setType("natural", x=> x >=0 , [dT["integer"]])
let min = 0, max = Number.MAX_SAFE_INTEGER
dT.t.setType("ctrlrange", x=> x >= min && x <= max, [dT["natural"]])
dT.controls["ctrlrange"] = {
  min: function(min){if (min) this._min = min; return this._min;},
  max: function(max){if (max) this._max = max; return this._max;}
}
dT.controls["ctrlrange"].min(min)
dT.controls["ctrlrange"].max(max)
dT.t.setType("ctrllinear", x=> x >= min && x <= Math.PI, [])
dT.controls["ctrllinear"] = {
  min: function(min){if (min) this._min = min; return this._min;},
  max: function(max){if (max) this._max = max; return this._max;}
}
dT.controls["ctrllinear"].min(min)
dT.controls["ctrllinear"].max(Math.PI)

dT.t.setEnum("functions", [
  "x=>x",
  "x=>x(x)",
  "(x,y)=>x",
  "(x,y)=>y",
  "(x,...y)=>y",
  "(x,y,z)=>x(y(z))",
  "(x,y,z)=>[x, z, y]",
  "(x,y)=>[x, y, y]",
  "x=>Math.sin(x)",
  "x=>Math.cos(x)",
  "x=>x*2",
  "x=>x*x",
  "(x,y)=>y.map(x)",
  "x=>x+1",
  "x=>x-1",
  "x=>1/x",
  "x=>0-x",

  "x=>Math.sin(x)",
  "x=>Math.cos(x)",
  "x=>Math.tan(x)",
  "x=>Math.sqrt(x)",
  "x=>Math.exp(x)",
  "x=>Math.log(x)",
  "x=>Math.abs(x)",
  "x=>Math.floor(x)",
])

dT.controls.bool = {
  random: function(typed){
    let type = typed.type
    let val = new dT.BN(Math.round(Math.random()))
    typed.value = val
    return typed
  }
}

dT.controls.jsfunction = {
  random: function(typed){
    return typed
  }
}

dT.typemap = [
  ["object", _.Object],
  ["function", _.Any],
  ["bytes20", "string"],
  ["address", "bytes20"],
  ["byte", "bytes1"],
  ["uint", "uint256"],
  ["int", "int256"],
  ["bool", "uint8"],
  ["tuple", _.Any], // may be better defined? _.RecordType
  ["any", _.Any],
  ["jsfunction", _.AnyFunction],
]

dT.t.extendTypes = function() {
  S.map (((y) => {
    if (y < 7) {
      dT.t.bnType( "uint"+y*8, new dT.BN(0), new dT.BN(2).pow(new dT.BN(y*8)))
      dT.t.bnType( "int"+y*8, new dT.BN(2).pow(new dT.BN(y*8-1)).neg(), new dT.BN(2).pow(new dT.BN(y*8-1)))
    } else {
      dT.t.bbnType( "uint"+y*8, new dT.BN(0), new dT.BN(2).pow(new dT.BN(y*8)))
      dT.t.bbnType( "int"+y*8, new dT.BN(2).pow(new dT.BN(y*8-1)).neg(), new dT.BN(2).pow(new dT.BN(y*8-1)))
    }
    dT.t.byteType("bytes"+y, y)
  })) (S.range (1) (33));

  dT.typemap.map(x=>{
    if (x[1] in dT.controls) {
      dT.t.setType(x[0], x=>true,[dT[x[1]]])
      dT.controls[x[0]] = Object.assign(
        {},
        dT.controls[x[1]],
        dT.controls[x[0]] || {},
      );
    } else {
      dT.t.setType(x[0], x=>true,[x[1]])
    }
  })
}

dT.t.extendTypes();

export default dT;
