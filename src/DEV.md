
# Quick setup
1. Install [Node](https://nodejs.org/en/).
2. `cd` to `shapetypes` folder.
3. Run `npm install`
4. Run `npm run cov`

# Testing
Run `npm run cov`

# Building documentation
Run `npm run doc`

# Tslint fixes
Run `npm run fix`

# Build release
```
# Make sure you're logged into NPM
npm login

# Reset the repo to the latest commit and build everything
npm run reset && npm run test && npm run cov:check && npm run doc:html

# Then version it with standard-version options. e.g.:
# don't bump package.json version (see: https://github.com/conventional-changelog/standard-version)
# npm run version -- --release-as major
npm run version -- --release-as minor
# npm run version -- --release-as patch
# npm run version -- --prerelease alpha

# And don't forget to push the docs to GitHub pages:
npm run doc:publish

# The follow the instruction in the output
# Which look something like: git push --follow-tags origin master && npm publish

```
CI via Travis-ci
Coverage via codecov.io
