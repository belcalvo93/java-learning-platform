# Spec Delta: user-auth-progress

## ADDED Requirements

### Requirement: Registration with data minimization and age verification
When registering for an optional account, the system SHALL only collect minimal personal data: email, password, optional display name, and optional country. Registration SHALL require a mandatory confirmation checkbox asserting that the user is 13 years of age or older ("Tengo 13 años o más"), without requesting exact date of birth or subnational region, in compliance with Ley 25.326 data minimization principles.

#### Scenario: User registers with minimal valid data and age confirmation
- **WHEN** a user enters their email, password, checks "Tengo 13 años o más", and clicks register
- **THEN** Firebase Auth creates the account and initial progress document without storing exact age or region

#### Scenario: User attempts to register without checking age confirmation
- **WHEN** a user fills the registration form but leaves the "Tengo 13 años o más" checkbox unchecked
- **THEN** registration is prevented and an accessible validation message explains that registration requires age confirmation

### Requirement: User rights of access and account erasure
The platform SHALL provide authenticated users with direct, automated controls to exercise their rights of access (downloading all stored data in standard JSON format) and erasure (permanently deleting their cloud progress document and authentication account upon explicit confirmation), in compliance with Argentine Law 25.326.

#### Scenario: User exports their personal data
- **WHEN** an authenticated user clicks "Descargar mis datos"
- **THEN** the system generates and prompts a download of a JSON file containing their profile metadata, completed lessons, completed exercises, and evaluation results

#### Scenario: User deletes their account and data
- **WHEN** an authenticated user confirms the action "Eliminar mi cuenta y mis datos"
- **THEN** the system deletes their document from `users/{uid}`, deletes their Firebase Auth account, cleans local cache, and restores the unauthenticated notice

### Requirement: Deferred SDK loading with zero-secret graceful degradation
The web application SHALL deliver `firebase-config.js` with empty configuration placeholders and zero hardcoded secrets. When configuration values are empty or network access is unavailable, the platform SHALL operate seamlessly in local-only mode (`localStorage`) without attempting to load external Firebase SDKs or throwing unhandled errors. When configured, Firebase SDKs SHALL load lazily upon opening the account interface.

#### Scenario: Unconfigured platform runs purely in local-first mode
- **WHEN** the application starts with empty Firebase configuration
- **THEN** no Firebase SDK scripts are loaded, and user interaction with the platform or account triggers a clear explanation that cloud sync is unconfigured while preserving local progress

#### Scenario: Configured platform lazily loads Firebase SDK upon account modal opening
- **WHEN** valid configuration is provided and a user clicks to open the account modal
- **THEN** the Firebase Auth and Firestore SDKs are loaded dynamically on demand with fixed versioning
