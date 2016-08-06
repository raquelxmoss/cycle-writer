import {div} from '@cycle/dom';
import xs from 'xstream';
import Showdown from 'showdown';

function updateText (event) {
  return function _updateText (state) {
    const isUppercase = event.shiftKey;
    const character = String.fromCharCode(event.which);
    const newChar = isUppercase ? character : character.toLowerCase();

    return Object.assign(
      {},
      state,
      {text: state.text + newChar}
    );
  };
}

function removeText (event) {
  return function _removeText (state) {
    let modifier = '';

    if (event.metaKey || event.ctrlKey) {
      modifier = '\n';
    }

    if (event.altKey) {
      modifier = ' ';
    }

    const text = state.text
      .split(modifier)
      .slice(0, state.text.split(modifier).length - 1)
      .join(modifier);

    return Object.assign({}, state, {text});
  };
}

function addPeriod () {
  return function _addPeriod (state) {
    return Object.assign({}, state, {text: state.text + '.'});
  };
}

function addNewLine () {
  return function _addNewLine (state) {
    return Object.assign({}, state, {text: state.text + '\n'});
  };
}

function toggleInstructions () {
  return function _toggleInstructions (state) {
    return Object.assign({}, state, {instructions: !state.instructions});
  };
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

function view (state) {
  const instructionsStyle = {
    display: state.instructions ? 'block' : 'none'
  };

  return (
    div('.container', [
      div('.toggle-instructions', 'Toggle Instructions'),
      div(
        '.instructions',
        {style: instructionsStyle},
        'Just write! You can use markdown syntax. Have fun!'
      ),
      div('.text', {props:{innerHTML: renderText(state.text)}})
    ])
  );
}

const initialState = {
  text: '',
  instructions: true
};

export default function App ({DOM, Keys}) {
  const instructions$ = DOM
    .select('.toggle-instructions')
    .events('click')
    .map(toggleInstructions);

  const textInput$ = Keys.press();

  const backspacePress$ = Keys.down('backspace');

  const spacePress$ = Keys.press('space');

  const removeText$ = backspacePress$
    .map(removeText);

  const addText$ = textInput$
    .filter(e => e.which !== 8 && e.which !== 46)
    .map(updateText);

  const period$ = Keys.down('.')
    .map(addPeriod);

  const enter$ = Keys.down('enter')
    .map(addNewLine);

  const action$ = xs.merge(
    addText$,
    removeText$,
    period$,
    enter$,
    instructions$
  );

  const state$ = action$
    .fold((state, action) => action(state), initialState);

  return {
    DOM: state$.map(view),
    preventDefault: xs.merge(backspacePress$, spacePress$)
  };
}
