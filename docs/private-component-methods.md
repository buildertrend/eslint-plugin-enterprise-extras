# Enforce private methods for class components

## Rule Details

This rule requires that all methods for class components (components that expect `React.Component` or similar) are private. Private
methods allow the compiler to cleanup unused references
