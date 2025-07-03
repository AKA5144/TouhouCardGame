export function adjustFontSizeToFit(element, maxFontSize = 35, minFontSize = 8) {
  let fontSize = maxFontSize;
  element.style.fontSize = fontSize + 'px';

  while (element.scrollWidth > element.clientWidth && fontSize > minFontSize) {
    fontSize--;
    element.style.fontSize = fontSize + 'px';
  }
}