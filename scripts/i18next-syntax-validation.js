function validate(message = '') {
  if (!(message || '').trim()) {
    throw new SyntaxError('Message is Empty.');
  }
  if (typeof message !== 'string') {
    throw new TypeError('Message must be a String.');
  }
  if (
    (message.includes('{') || message.includes('}'))
    && !/\{\{ ?(?:- |\w+?)(, ?)?\w+ ?\}\}/.test(message)
  ) {
    throw new SyntaxError(
      'Interpolation error. See: https://www.i18next.com/misc/json-format',
    );
  }
<<<<<<< HEAD
  if (message.includes('$t(') && !/\$t\(\w+:\w+(?:\.\w+)*\)/g.test(message)) {
=======
  if (message.includes('$t(') && !/\$t\(\w+:\w+(?:\.\w+)*\)/.test(message)) {
>>>>>>> f6309e9
    throw new SyntaxError(
      'Nesting error. See: https://www.i18next.com/misc/json-format',
    );
  }
}

module.exports = validate;
