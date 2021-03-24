# Disallow href direct assignment

## Rule Details

This rule prevents direct assignment to `window.location.href` (or similar) for redirection. Instead, `window.location.assign()` is preferred as is easier to mock when testing
