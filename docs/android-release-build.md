# Building a Signed Android Release APK

Everything here is free — no Play Store account needed to share the APK directly with people.

## One-time setup (already done, documented in case it's ever needed again)

### 1. Generate a release keystore

This is the identity of your app. **Every future update must be signed with the same keystore**, or Android will refuse to install it over the existing app (users would have to uninstall the old one first, losing nothing in the backend but breaking the "update in place" flow).

```bash
keytool -genkeypair -v \
  -keystore chatee-release.keystore \
  -alias chatee \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "<a-real-password>" \
  -keypass "<a-real-password>" \
  -dname "CN=Chatee, OU=Chatee, O=Chatee, L=Unknown, ST=Unknown, C=IN"
```

If `keytool` isn't on your `PATH`, it ships inside Android Studio's bundled JDK: on Windows that's `"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"`.

**Store this file somewhere outside the git repo** (this project's keystore lives at `C:\Users\Negi\chatee-keystore\chatee-release.keystore`) and back it up — a password manager, an encrypted drive, anywhere durable that isn't just this machine. If it's lost, there is no recovery; you'd have to ship the app under a new identity and every existing install would need to be manually replaced.

### 2. Wire the keystore into the Gradle build

`android/keystore.properties` (gitignored — never commit this):
```properties
storeFile=C:/Users/Negi/chatee-keystore/chatee-release.keystore
storePassword=<a-real-password>
keyAlias=chatee
keyPassword=<a-real-password>
```

`android/app/build.gradle` reads it and applies it to the `release` build type — already configured. If you ever regenerate `android/` from scratch (`npx cap add android` again), you'd need to re-add the `signingConfigs` block; see the current `build.gradle` for the exact snippet.

`android/.gitignore` already excludes `*.keystore`, `*.jks`, and `keystore.properties`, so none of this can accidentally end up in git.

## Every release: building the signed APK

### 1. Point the web build at the right backend

- **Real release** (what friends/users will use): `npm run build` — uses `.env.production` (`https://chatee.abrdns.com`).
- **Local testing on your own phone** (same WiFi as your dev machine): `npm run build:local-mobile` — uses `.env.local-mobile` (your machine's LAN IP). Not for real distribution — friends elsewhere on the internet can't reach your laptop.

### 2. Sync the web build into the Android project

```bash
npx cap sync android
```

### 3. Build the signed release APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`.

### 4. Verify it's actually signed with your release key (not accidentally unsigned)

```bash
"C:\Users\Negi\AppData\Local\Android\Sdk\build-tools\35.0.0\apksigner.bat" verify --print-certs android/app/build/outputs/apk/release/app-release.apk
```

Should print `Signer #1 certificate DN: CN=Chatee, ...` — if this errors out instead, the APK isn't signed and won't install on most devices.

### 5. Distribute

Just send `app-release.apk` directly — Google Drive link, WhatsApp, email, whatever. Whoever installs it needs to allow "install from unknown sources" for whichever app they use to open the file — that's an Android permission prompt, not a cost. No Play Store account, no fee.

## Releasing an update later

Android identifies app versions by `versionCode` (an integer that must strictly increase) and `versionName` (the human-readable string). Both live in `android/app/build.gradle`:

```groovy
defaultConfig {
    ...
    versionCode 1
    versionName "1.0"
}
```

Before building a new release APK, bump `versionCode` (e.g. `2`) and `versionName` (e.g. `"1.1"`), then repeat the build steps above with the **same keystore**. Friends can then install the new APK directly over the old one without uninstalling first.

## If you ever want the Play Store instead

Not required for sharing with friends, but if you want it discoverable/auto-updating via Google Play: register a one-time Google Play Console developer account ($25, one-time, not recurring), then upload an **App Bundle** instead of an APK — `./gradlew bundleRelease` produces `android/app/build/outputs/bundle/release/app-release.aab`, signed the same way via the same `keystore.properties` setup already in place.
