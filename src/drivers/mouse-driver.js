import fromEvent from 'xstream/extra/fromEvent';

export default function KeysDriver () {
  return {
    up () {
      return fromEvent(document, 'keyup');
    },
    press () {
      return fromEvent(document, 'keypress');
    }
  };
}
