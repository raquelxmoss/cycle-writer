import {input, div, button, p} from '@cycle/dom'
import keycode from 'keycode';
import {Observable} from 'rx';
import Showdown from 'showdown';
// implement cmd + backspace/ ctrl + backspace

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

function squash (event) {
  return function stopThing (state) {
    event.preventDefault();

    return state;
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

  const textInput$ = Keys.presses('keypress')

  const removeText$ = Keys.presses('keydown', 'backspace')
    .map(e => removeText(e))

	const addText$ = textInput$
		.filter(e => e.which !== 8 && e.which !== 46)
		.map(e => updateText(e));

  const spacePress$ = Keys.presses('keypress', 'space')
    .map(e => squash(e));

  const period$ = Keys.presses('keydown', '.')
    .map(_ => addPeriod());

  const enter$ = Keys.presses('keydown', 'enter')
    .map(_ => addNewLine());

	const action$ = Observable.merge(
		addText$,
		removeText$,
    spacePress$,
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
		)
  }
}
