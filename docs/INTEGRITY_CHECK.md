# CueMesh Integrity Checklist

## Auth
- [ ] Google provider enabled in Firebase Auth
- [ ] Email/Password provider enabled in Firebase Auth
- [ ] Authorized domains include `localhost` and `<project>.web.app`

## Firestore
- [ ] `shows/{showId}` documents exist
- [ ] `shows/{showId}/members/{uid}` documents exist after join
- [ ] `shows/{showId}/cues/{cueId}` documents exist after cue creation

## Functions
- [ ] Cloud Functions deployed (v2)
- [ ] Logs show `onCueStatusChange` trigger firing when cue status updates
