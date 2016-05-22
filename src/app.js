import {input, div, button, p} from '@cycle/dom'
import keycode from 'keycode';
import {Observable} from 'rx';
import Showdown from 'showdown';

function updateText (event) {
  return function processTextInput (state) {
    const isUppercase = event.shiftKey
    const character = String.fromCharCode(event.which);
    const newChar = isUppercase ? character : character.toLowerCase();

    return Object.assign(
      {},
      state,
      {text: state.text + newChar}
    );
  }
}

function removeText (event) {
  debugger
  return function processTextRemove (state) {
    const text = state.text
    .split('')
    .slice(0, state.text.length - 1)
    .join('');

    return Object.assign({}, state, {text});
  }
}

function addPeriod () {
  return function processAddPeriod (state) {
    return Object.assign({}, state, {text: state.text + '.'});
  }
}

function addNewLine () {
  return function processAddNewLine (state) {
    return Object.assign({}, state, {text: state.text + '\n'});
  }
}

function toggleInstructions () {
  return function processToggleInstructions (state) {
    return Object.assign({}, state, {instructions: !state.instructions});
  }
}

function renderText (text) {
  const converter = new Showdown.Converter(
    {
      strikethrough: true,
      tasklists: true,
      smoothLivePreview: true,
      parseImgDimensions: true
    }
  );

  return converter.makeHtml(text);
}

const initialState = {
  text: "",
  instructions: true
}

export default function App ({DOM, Keys}) {
  const instructions$ = DOM
    .select('.toggle-instructions')
    .events('click')
    .map(_ => toggleInstructions())

  const textInput$ = Keys.press('keypress')

  const backspacePress$ = Keys.press('keydown', 'backspace')

  const spacePress$ = Keys.press('keypress', 'space')

  const removeText$ = backspacePress$
    .map(e => removeText(e))

  const addText$ = textInput$
    .filter(e => e.which !== 8 && e.which !== 46)
    .map(e => updateText(e));

  const period$ = Keys.presses('keydown', '.')
    .map(_ => addPeriod());

  const enter$ = Keys.presses('keydown', 'enter')
    .map(_ => addNewLine());

  const action$ = Observable.merge(
    addText$,
    removeText$,
    period$,
    enter$,
    instructions$
  );

  const state$ = action$
    .startWith(initialState)
    .scan((state, action) => action(state))

  return {
    DOM: state$.map(state =>
      div('.container', [
        div('.toggle-instructions', 'Toggle Instructions'),
          div(
            '.instructions',
            {style: {display: state.instructions ? 'block': 'none'}},
            'Just write! You can use markdown syntax. Have fun!'
          ),
          div('.text', {innerHTML: renderText(state.text)}),
        ])
       ),
   preventDefault: Observable.merge(backspacePress$, spacePress$)
  }
}
