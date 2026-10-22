# ADR 0001: Use Expo for the React Native app

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

DuesUp is an Android-first subscription tracker built by a single developer. The app needs:

- A fast, productive UI layer, building on existing React experience
- Custom native code later, specifically Google Play Billing and reliable background reminders, written in Kotlin
- A maintainable build and release pipeline that one person can manage
- A path to iOS later without a rewrite

The options considered were:

1. **Native Android (Kotlin + Jetpack Compose)** — best native integration, but no iOS path and no reuse of React skills.
2. **Bare React Native** — full control over the native projects, but the developer owns all native configuration, upgrades and build tooling by hand.
3. **Expo (React Native with development builds)** — the framework recommended by the React Native team, with managed native configuration, first-class support for custom native modules, and integrated build and submission tooling.

## Decision

Use **Expo** with TypeScript and Expo Router.

Custom native functionality will be written in **Kotlin using the Expo Modules API**, and the app will move from Expo Go to **development builds** once the first native module is added.

The project starts on **Expo SDK 57**, the latest SDK supported by Expo Go on the current test device. This allows fast iteration during early UI work. The project will be **upgraded to the latest SDK before any native module work begins**, since development builds remove the dependency on Expo Go.

## Consequences

**Positive**
- Fast iteration on UI and logic in TypeScript, reusing React experience
- Native Android configuration is generated from `app.json` and config plugins rather than maintained by hand, which makes SDK upgrades more predictable
- The Expo Modules API gives a clean, typed way to write Kotlin modules without dropping to bare React Native
- EAS Build and EAS Submit are available for automating builds and Play Store delivery
- iOS remains possible later with the same codebase, apart from platform-specific native modules

**Negative**
- An extra abstraction layer over the native projects, so some build issues require understanding both Expo and Gradle
- Expo Go cannot be used once custom native modules are added; development builds take longer to set up and rebuild
- Starting on SDK 57 means a planned SDK upgrade early in the project

**Follow-ups**
- Upgrade to the latest Expo SDK before adding the first native module
- Set up development builds and Android Studio at that point