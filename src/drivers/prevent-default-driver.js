export default function preventDefaultDriver (event$) {
  event$.addListener({
    next: (ev) => ev.preventDefault(),
    error: () => console.log('prevent default error'),
    complete: () => {}
  });

  return Object.create(null);
}
