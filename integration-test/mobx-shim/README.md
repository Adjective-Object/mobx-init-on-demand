# mobx-shim

Shim package meant for testing other repos against mobx.

Since the lazy init behaviour we have here is explicitly opt-in, in order to test against other codebases that aren't aware of the library, we hack together this wrapper.

Note that this wrapper should not be expected to work in production, and in fact, it is an explicit non-goal of this project to provide a production-ready api-compatible wrapper for mobx.
