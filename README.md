# Interop ranking

This is the source for [a site](https://interop-rank.jakearchibald.com/) used to gather relative developer preference on [interop proposals](https://github.com/web-platform-tests/interop/).

## Development

To test without GitHub login, add this to `.dev.vars`:

```
DEV_USER_ID=1
```

Requests without a session are then treated as that GitHub user ID (use an admin's ID to test admin pages). This only works in dev builds.
