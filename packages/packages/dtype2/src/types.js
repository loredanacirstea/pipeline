import _ from 'sanctuary-def';
import S from 'sanctuary';
import BN from 'bn.js';

function dT_setTypes(dT) {
  dT["bn"] = _.NullaryType
    ("bn")
    (dT.settings.refURL+"bn")
    ([])
    (x => BN.isBN(x))

  dT.controls["bn"] = {
    min: function(min){if (min !== undefined) this._min = min; return this._min;},
    max: function(max){if (max !== undefined) this._max = max; return this._max;},
    random: function(typed){
      let type = typed.type
      let range = dT.t.getRange(typed)
      let val = range.max.sub(new BN(Math.random()*Number.MAX_SAFE_INTEGER).mul(range.max.sub(range.min)).div(new BN(Number.MAX_SAFE_INTEGER)))
      return ({value:  val, type: type})
    },
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
        type: 'range', label: typed.name+":"+typed.type,
        min: dT.controls[typed.type].min().toNumber(),
        max: dT.controls[typed.type].max().toNumber(), step: 1 ,
        folder: folder,
        initial: typed.value.toNumber(),
        onChange: (data) => {
          typed.value  = new BN(data)
          if (onChange) onChange(typed);
       }
     })
      return typed
    },

  }

  dT.controls["bbn"] = {
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
          type: 'text', label: typed.name+":"+typed.type,
          folder: folder,
          initial: "0x"+typed.value.toString(16),
        onChange: (data) => {
          console.log(data);
          if (data.substring(0, 2) === '0x') {
            typed.value  = new BN(data.substring(2), 16)
          } else {
            // TODO: fix type checking in UI
            typed.value  = new BN(parseInt(data));
          }
          console.log(typed);
          if (onChange) onChange(typed);
       }
     })
      return typed
    },

    }

  dT["string"] = _.NullaryType
    ("string")
    (dT.settings.refURL+"string")
    ([])
    (x => typeof(x) === "string")

  dT.controls["string"] = {
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
          type: 'text', label: typed.name+":"+typed.type,
          folder: folder,
          initial: typed.value,
        onChange: (data) => {
          console.log(data);
          typed.value  = data
          console.log(typed);
          if (onChange) onChange(typed);
       }
     })
      return typed
    },
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
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
        type: 'range', label: typed.name+":"+typed.type,
        min: dT.controls[typed.type].min(),
        max: dT.controls[typed.type].max(),
        step: 1,
        folder: folder,
        initial: typed.value,
        onChange: (data) => {
          typed.value  = data;
          if (onChange) onChange(typed);
       }
     })
      return typed
    },

  }


  dT.enums.controls = {
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
        type: 'select', label: typed.name+":"+typed.type,
        options: dT.enum_choices[typed.type.substring(5)],
        folder: folder,
        initial: typed.value,
        onChange: (data) => {
          console.log(data);
          typed.value  = data
          console.log(typed);
          if (onChange) onChange(typed);
       }
     })
      return typed
    },

    random: function(typed){
      let type = typed.type
      let range = dT.t.getRange(typed)
      let val = new BN(Math.random()*Number.MAX_SAFE_INTEGER).mul(range.max.sub(range.min)).div(new BN(Number.MAX_SAFE_INTEGER))
      val = val.toNumber()
      val = dT.enum_choices[type.substring(5)][val]
      typed.value = val
      return typed
    }


  }

  dT.controls.tuple = {
    showControl: function(typed, folder, gui, onChange){
      let fold1 = folder+"."+typed.name
      gui.Register(
      {
        type: 'folder',
        label: fold1,
        folder: folder,
        open: true
      })
      return fold1
    },

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
    showControl: dT.controls.tuple.showControl ,
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

   S.map (((y)=>{
     if (y < 7) {
       dT.t.bnType( "uint"+y*8, new BN(0), new BN(2).pow(new BN(y*8)))
       dT.t.bnType( "int"+y*8, new BN(2).pow(new BN(y*8-1)).neg(), new BN(2).pow(new BN(y*8-1)))
     } else {
       dT.t.bbnType( "uint"+y*8, new BN(0), new BN(2).pow(new BN(y*8)))
       dT.t.bbnType( "int"+y*8, new BN(2).pow(new BN(y*8-1)).neg(), new BN(2).pow(new BN(y*8-1)))
     }
     dT.t.byteType("bytes"+y, y)
  })) (S.range (1) (33));

  let types = [
    ["object", _.Object],
    ["function", _.Any],
    ["address", "bytes20"],
    ["byte", "bytes1"],
    ["uint", "uint256"],
    ["int", "int256"],
    ["bool", "uint8"],
    ["tuple", _.Any], // may be better defined? _.RecordType
    ["any", _.Any],
    ["jsfunction", _.AnyFunction],
  ]

  types.map(x=>{

    if (x[1] in dT.controls) {
      dT.t.setType(x[0], x=>true,[dT[x[1]]])
      dT.controls[x[0]] = dT.controls[x[1]]
    } else {
      dT.t.setType(x[0], x=>true,[x[1]])
    }

  })

  dT.controls.bool = {
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
        type: 'checkbox', label: typed.name,
        folder: folder,
        initial: typed.value.gt(new BN(0)),
        onChange: (data) => {
          console.log(data);
          typed.value  = data
          console.log(typed);
          if (onChange) onChange(typed);
       }
     })
      return typed
    },

    random: function(typed){
      let type = typed.type
      let val = new BN(Math.round(Math.random()))
      console.log(val.toNumber())
      typed.value = val
      return typed
    }

  }

  dT.controls.jsfunction = {
    showControl: function(typed, folder, gui, onChange){
      gui.Register({
        type: 'button', label: typed.name,
        folder: folder,
        action: typed.value
     })
      return typed
    },
    random: function(typed){
      return typed
    }


  }


  return dT;
}

export default dT_setTypes;
