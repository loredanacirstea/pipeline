import guify from 'guify';
import dT from '@pipeos/dtype2';
import './types';

function showControl(vObj, divId, options = {}) {
  let div = document.getElementById(divId)
  div.innerHTML=""
  const DEFAULT_OPTS = {
    align: 'left',
    theme: {
        name: "YoRHa",

        colors: {
            menuBarBackground: '#CCC8B1',
            menuBarText: '#454138',
            panelBackground: '#fff', //'#CCC8B1',

            componentBackground: '#BAB5A1',
            componentBackgroundHover: '#877F6E',
            componentForeground: '#454138',
            componentActive: '#978F7E',

            textPrimary: '#454138',
            textSecondary: '#454138',
            textHover: '#CCC8B1',
            textActive: '#CCC8B1',
        },

        //Optional
        font: {
            fontFamily: `Roboto Condensed, helvetica, sans-serif`,
            fontSize: '14px',
            //fontWeight: '100'
        },
    },
    root: div,
    open: true,
    barMode: "none",
    panelMode: "inner",
    width: "50%",
    opacity: 0.90,
  }

  const onChangeSubTyped = (typed) => {
    options.onChange(typed);
  }

  const guiOptions = Object.assign({}, DEFAULT_OPTS, options.gui || {});
  let gui = new guify(guiOptions);
  const features = options.buttons || [];

  if (options.randomize) {
    features.push({ type: "button", label: "Randomize", action: () => {
      vObj=dT.t.apply(vObj, "random");
      showControl(vObj, divId, options);
      if (options.onChange) {
        options.onChange(vObj);
      }
    }});
  }

  if (options.live) {
    features.push({ type: "checkbox",  label: "Every Change", initial: false});
  }

  if (options.toast) {
    features.push({ type: "button", label: "Toast", action:() => {gui.Toast('Possible error!');}});
  }

  const component = gui.Register(features);

  return dT.t.apply(vObj, "showControl", "", {
    onChange: onChangeSubTyped,
    args: [gui],
  });
}

export default showControl;
