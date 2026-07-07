export function insertAtCursor(value, selectionStart, selectionEnd, insertText) {
  return {
    value: value.slice(0, selectionStart) + insertText + value.slice(selectionEnd),
    cursor: selectionStart + insertText.length,
  }
}

export function backspaceAtCursor(value, selectionStart, selectionEnd) {
  if (selectionStart === selectionEnd) {
    return {
      value: value.slice(0, Math.max(0, selectionStart - 1)) + value.slice(selectionEnd),
      cursor: Math.max(0, selectionStart - 1),
    }
  }
  return {
    value: value.slice(0, selectionStart) + value.slice(selectionEnd),
    cursor: selectionStart,
  }
}
