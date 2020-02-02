import dT from '@pipeos/dtype2';

function createBtn(text, onclick) {
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.onclick = onclick;
  btn.style.backgroundColor = "rgb(186, 181, 161)";
  btn.style.padding = "2px";
  return btn;
}

function guiRegister(typed, gui, guiOptions, options = {}, getContainer) {
  const component = gui.Register(guiOptions);
  const {arrOptions, onChange} = options;

  if (arrOptions) {
    const container = getContainer ? getContainer(component) : component.container.children[0];

    if (arrOptions.remove) {
      const removeBtn = createBtn('-', () => {
        console.log('remove');
        component.Remove();
        if (onChange) onChange(null);
      });
      container.appendChild(removeBtn);
    }
    if (arrOptions.add) {
      const addBtn = createBtn('+', () => {
        console.log('add', typed);
        // arrOptions.add(arrOptions.index + 1);
        const newElem = JSON.parse(JSON.stringify(typed));
        // newArrayElem.value = newArrayElem.value;
        if (onChange) onChange(newElem, arrOptions.index + 1);
      });
      container.appendChild(addBtn);
    }
  }
  return component;
}

dT.controls.bn.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
    type: 'range', label: typed.name+":"+typed.type,
    min: dT.controls[typed.type].min().toNumber(),
    max: dT.controls[typed.type].max().toNumber(), step: 1 ,
    folder: folder,
    initial: typed.value.toNumber(),
    onChange: (data) => {
      typed.value  = new dT.BN(data)
      if (onChange) onChange(typed);
   }
  }

  const component = guiRegister(typed, gui, guiOptions, options);
  console.log('component dT.controls["bn"]', component);

  return typed
}

dT.controls.bbn.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
    type: 'text', label: typed.name+":"+typed.type,
    folder: folder,
    initial: "0x"+typed.value.toString(16),
    onChange: (data) => {
      console.log(data);
      if (data.substring(0, 2) === '0x') {
        typed.value  = new dT.BN(data.substring(2), 16)
      } else {
        // TODO: fix type checking in UI
        typed.value  = new dT.BN(parseInt(data));
      }
      console.log(typed);
      if (onChange) onChange(typed);
   }
  }
  const component = guiRegister(typed, gui, guiOptions, options);
  console.log('component dT.controls["bbn"]', component);

  return typed
}

dT.controls.string.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
    type: 'text', label: typed.name+":"+typed.type,
    folder: folder,
    initial: typed.value,
    onChange: (data) => {
      console.log(data);
      typed.value  = data
      console.log(typed);
      if (onChange) onChange(typed);
    }
  }

  const component = guiRegister(typed, gui, guiOptions, options);
  console.log('dT.controls["string"]', component);

  return typed
}

dT.controls.natural.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
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
  }
  const component = guiRegister(typed, gui, guiOptions, options);
  console.log('dT.controls["natural"]', component);

  return typed
}

dT.enums.controls.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
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
  }
  const component = guiRegister(typed, gui, guiOptions, options);
  console.log('dT.enums.controls', component);

  return typed
}

dT.controls.tuple.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  let fold1 = folder+"."+typed.name
  const guiOptions = {
    type: 'folder',
    label: fold1,
    folder: folder,
    open: true
  }
  const getContainer = comp => comp.container;
  const component = guiRegister(typed, gui, guiOptions, options, getContainer);

  return fold1
}

dT.controls.array.showControl = function(typed, folder, options = {}) {
  const {onChange, args, arrOptions} = options;
  const [gui] = args;
  let fold1 = folder+".$."+typed.name
  const guiOptions = {
    type: 'folder',
    label: fold1,
    folder: folder,
    open: true
  }
  const component = gui.Register(guiOptions);

  // Add sub-element in array at index 0
  if (arrOptions.addInner) {
    const addElemBtn = createBtn('+', () => {
      arrOptions.addInner(0);
    });
    component.container.insertBefore(addElemBtn, component.container.children[1]);
  }

  // If array is part of another array, remove array button
  if (arrOptions.remove) {
    const removeBtn = createBtn('-', () => {
      component.Remove();
      if (onChange) onChange(null);
    });
    component.container.appendChild(removeBtn);
  }

  // If array is part of another array, add another array after it
  if (arrOptions.add) {
    const addBtn = createBtn('+', () => {
      const newArrayElem = Object.assign({}, typed);
      newArrayElem.value = [newArrayElem.value[0]];
      if (onChange) onChange(newArrayElem, arrOptions.index + 1);
    });
    component.container.appendChild(addBtn);
  }

  return fold1
}

dT.controls.bool.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
    type: 'checkbox', label: typed.name,
    folder: folder,
    initial: typed.value, // .gt(new dT.BN(0)),
    onChange: (data) => {
      console.log(data);
      typed.value  = data
      console.log(typed);
      if (onChange) onChange(typed);
   }
  }
  const component = guiRegister(typed, gui, guiOptions, options);

  return typed
}

dT.controls.jsfunction.showControl = function(typed, folder, options = {}) {
  const {onChange, args} = options;
  const [gui] = args;
  const guiOptions = {
    type: 'button', label: typed.name,
    folder: folder,
    action: typed.value
  }
  const component = guiRegister(typed, gui, guiOptions, options);

  return typed
}

//wasm

// dT.controls.u32.showControl = function(typed, folder, options = {}) {
//   const {onChange, args} = options;
//   const [gui] = args;
//   const guiOptions = {
//     type: 'range', label: typed.name+":"+typed.type,
//     min: dT.controls[typed.type].min().toString(10),
//     max: dT.controls[typed.type].max().toString(10), step: 1 ,
//     folder: folder,
//     initial: typed.value.toString(10),
//     onChange: (data) => {
//       typed.value  = BigInt(data)
//       if (onChange) onChange(typed);
//    }
//   }
//
//   const component = guiRegister(typed, gui, guiOptions, options);
//   console.log('component dT.controls["bn"]', component);
//
//   return typed
// }

// dT.controls.i32.showControl = function(typed, folder, options = {}) {
//   const {onChange, args} = options;
//   const [gui] = args;
//   const guiOptions = {
//     type: 'text', label: typed.name+":"+typed.type,
//     folder: folder,
//     initial: typed.value,
//     onChange: (data) => {
//       console.log(data);
//       typed.value  = BigInt(data)
//       console.log(typed);
//       if (onChange) onChange(typed);
//     }
//   }
//
//   const component = guiRegister(typed, gui, guiOptions, options);
//   console.log('dT.controls["string"]', component);
//
//   return typed
// }
//
// dT.controls.i64.showControl = dT.controls.i32.showControl
// dT.controls.u64.showControl = dT.controls.u32.showControl
//
// dT.controls.f32.showControl =  function(typed, folder, options = {}) {
//   const {onChange, args} = options;
//   const [gui] = args;
//   const guiOptions = {
//     type: 'text', label: typed.name+":"+typed.type,
//     folder: folder,
//     initial: typed.value,
//     onChange: (data) => {
//       console.log(data);
//       typed.value  = Float32Array([data]);
//       console.log(typed);
//       if (onChange) onChange(typed);
//     }
//   }
//
//   const component = guiRegister(typed, gui, guiOptions, options);
//   console.log('dT.controls["string"]', component);
//
//   return typed
// }
//
// dT.controls.f64.showControl = dT.controls.f32.showControl

dT.t.extendTypes();

export {dT, guiRegister, createBtn};
