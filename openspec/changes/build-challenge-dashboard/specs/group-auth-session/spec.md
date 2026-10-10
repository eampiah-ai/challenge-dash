# Spec Delta

## Purpose

Lets participants join the challenge with a simple, shared credential and remain authenticated across visits so they can log and view progress without repeated prompts.

## ADDED Requirements

### Requirement: Participants can log in with a shared group password and timezone is detected
The system SHALL authenticate a participant when they provide a display name and the correct shared group password, and it SHALL capture the browser's timezone for new participants.

#### Scenario: Successful first-time login
- **WHEN** a user submits a display name, the correct shared group password, and a browser timezone of `America/Chicago`
- **THEN** the system creates a participant record with `America/Chicago` as the home timezone and establishes a session

#### Scenario: Successful login from a different timezone while traveling
- **WHEN** an existing participant with home timezone `America/Chicago` logs in from a browser reporting `America/New_York`
- **THEN** the system establishes a session and prompts the participant to choose "Temporary travel" or "Update home timezone"

#### Scenario: Update home timezone
- **WHEN** a participant chooses "Update home timezone" on the timezone mismatch prompt
- **THEN** the system updates the stored home timezone and continues to the dashboard

#### Scenario: Keep home timezone for temporary travel
- **WHEN** a participant chooses "Temporary travel" on the timezone mismatch prompt
- **THEN** the system keeps the stored home timezone and continues to the dashboard

#### Scenario: Failed login with wrong password
- **WHEN** a user submits a display name and an incorrect shared group password
- **THEN** the system rejects the request with a clear error message and does not establish a session

#### Scenario: Failed login with missing display name
- **WHEN** a user submits the login form without a display name
- **THEN** the system rejects the request with a clear error message

### Requirement: Sessions persist across visits
The system SHALL keep a participant logged in via an encrypted session cookie until they explicitly log out or the cookie expires.

#### Scenario: Authenticated page access
- **WHEN** a participant with a valid session cookie visits a protected page
- **THEN** the system allows access without requiring re-authentication

#### Scenario: Unauthenticated page access
- **WHEN** a participant without a valid session cookie visits a protected page
- **THEN** the system redirects them to the login page

### Requirement: Participants can log out
The system SHALL allow an authenticated participant to end their session.

#### Scenario: Successful logout
- **WHEN** an authenticated participant triggers logout
- **THEN** the system clears the session cookie and redirects to the login page
