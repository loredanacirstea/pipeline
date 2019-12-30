import dT from '@pipeos/dtype2';

function createBtn(text, onclick) {
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.onclick = onclick;
  btn.style.backgroundColor = "rgb(186, 181, 161)";
  btn.style.padding = "2px";
  return btn;
}

dT.controls.bn.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  const component = gui.Register({
    type: 'range', label: typed.name+":"+typed.type,
    min: dT.controls[typed.type].min().toNumber(),
    max: dT.controls[typed.type].max().toNumber(), step: 1 ,
    folder: folder,
    initial: typed.value.toNumber(),
    onChange: (data) => {
      typed.value  = new dT.BN(data)
      if (onChange) onChange(typed);
   }
  })
  console.log('component dT.controls["bn"]', component);
  return typed
}

dT.controls.bbn.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  const component = gui.Register({
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
  })
  console.log('component dT.controls["bbn"]', component);
  return typed
}

dT.controls.string.showControl = function(typed, folder, {onChange, args, arrOptions}) {
  const [gui] = args;
  const component = gui.Register({
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
  console.log('dT.controls["string"]', component);
  console.log('-------- arrOptions', arrOptions);
  if (arrOptions) {
    if (arrOptions.add && arrOptions.index === 0) {
      const addBtnBef = createBtn('+', () => {
        console.log('add');
        arrOptions.add(arrOptions.index);
      });
      component.container.children[0].appendChild(addBtnBef);
    }
    if (arrOptions.remove) {
      const removeBtn = createBtn('-', () => {
        console.log('remove');
        component.Remove();
        if (onChange) onChange(null);
      });
      component.container.children[0].appendChild(removeBtn);
    }
    if (arrOptions.add) {
      const addBtn = createBtn('+', () => {
        console.log('add');
        arrOptions.add(arrOptions.index + 1);
      });
      component.container.children[0].appendChild(addBtn);
    }
  }

  return typed
}

dT.controls.natural.showControl = function(typed, folder, {onChange, args}){
  const [gui] = args;
  const component = gui.Register({
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
  console.log('dT.controls["natural"]', component);
  return typed
}

dT.enums.controls.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  const component = gui.Register({
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
  console.log('dT.enums.controls', component);
  return typed
}

dT.controls.tuple.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  console.log('dT.controls.tuple.showControl', typed, folder);
  console.log('dT.controls.tuple.showControl onChange', onChange);
  console.log('dT.controls.tuple.showControl args', args);
  let fold1 = folder+"."+typed.name
  const component = gui.Register(
  {
    type: 'folder',
    label: fold1,
    folder: folder,
    open: true
  })
  console.log('dT.controls.tuple', component);
  return fold1
}

dT.controls.array.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  let fold1 = folder+"."+typed.name
  const component = gui.Register(
  {
    type: 'folder',
    label: fold1,
    folder: folder,
    open: true
  })
  console.log('dT.controls.array', component);
  return fold1
}

dT.controls.bool.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  const component = gui.Register({
    type: 'checkbox', label: typed.name,
    folder: folder,
    initial: typed.value.gt(new dT.BN(0)),
    onChange: (data) => {
      console.log(data);
      typed.value  = data
      console.log(typed);
      if (onChange) onChange(typed);
   }
  })
  console.log('dT.controls.bool', component);
  return typed
}

dT.controls.jsfunction.showControl = function(typed, folder, {onChange, args}) {
  const [gui] = args;
  gui.Register({
    type: 'button', label: typed.name,
    folder: folder,
    action: typed.value
 })
  return typed
}

dT.t.extendTypes();

export default dT;
