# Spec Delta

## Purpose

Gives every authenticated participant a shared view of the group's progress, fostering accountability and motivation throughout the challenge.

## ADDED Requirements

### Requirement: Group dashboard displays all participants
The system SHALL display a list of all participants who have joined the challenge.

#### Scenario: View group dashboard
- **WHEN** an authenticated participant visits the dashboard
- **THEN** the system shows every participant's display name and progress summary

### Requirement: Dashboard shows per-participant completion rate
The system SHALL calculate and display each participant's completion rate across all loggable habits for the challenge to date.

#### Scenario: View completion summary
- **WHEN** an authenticated participant views the dashboard
- **THEN** the system shows each participant's overall completion percentage and a breakdown by habit type

### Requirement: Dashboard shows timezone-aware current streaks
The system SHALL calculate and display each participant's current daily habit streak using the participant's stored timezone.

#### Scenario: View streaks
- **WHEN** an authenticated participant views the dashboard
- **THEN** the system shows the number of consecutive local days each participant has completed all daily habits, based on the dates they logged

### Requirement: Dashboard shows recent activity
The system SHALL display each participant's most recent logged entries.

#### Scenario: View recent entries
- **WHEN** an authenticated participant views the dashboard
- **THEN** the system shows the latest dates each participant logged progress and which habits were completed

### Requirement: Dashboard is read-only for other participants' data
The system SHALL allow a participant to view other participants' progress but not modify it.

#### Scenario: Attempt to modify another participant's entry
- **WHEN** an authenticated participant submits progress using another participant's identifier
- **THEN** the system rejects the request and logs no changes for the other participant
