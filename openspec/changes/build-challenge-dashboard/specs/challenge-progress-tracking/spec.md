# Spec Delta

## Purpose

Provides participants with a structured way to record daily, weekly, bi-weekly, monthly, and Sunday-reset progress for a single 3-month self-improvement challenge.

## ADDED Requirements

### Requirement: Daily habits can be logged for a selected local date
The system SHALL allow an authenticated participant to record the status of each daily habit for a selected local date within the challenge window.

#### Scenario: Log a complete day
- **WHEN** an authenticated participant submits the daily form with all daily habits marked complete for a valid challenge date
- **THEN** the system stores the record against the selected local date and confirms the save

#### Scenario: Log a partial day
- **WHEN** an authenticated participant submits the daily form with only some daily habits marked complete
- **THEN** the system stores only the completed habits against the selected local date and confirms the save

#### Scenario: Reject logging outside challenge window
- **WHEN** an authenticated participant attempts to log progress for a date before the challenge start or after the challenge end
- **THEN** the system rejects the request with a clear error message

### Requirement: Daily entry defaults to the participant's current local today
The system SHALL default the daily entry date to the participant's current local today based on their stored timezone.

#### Scenario: Open entry page late at night
- **WHEN** an authenticated participant in the America/Chicago timezone opens the entry page at 11:30 PM local time
- **THEN** the system defaults the date picker to today in America/Chicago, not a future UTC date

#### Scenario: Travel across timezones
- **WHEN** an authenticated participant travels to a different timezone, chooses "Temporary travel" on the login prompt, and opens the entry page
- **THEN** the system defaults to their stored home timezone today, and the participant may manually adjust the date if needed

### Requirement: Weekly habits can be logged
The system SHALL allow an authenticated participant to record weekly habits once per calendar week within the challenge window.

#### Scenario: Log weekly habits
- **WHEN** an authenticated participant submits the weekly form with savings and project/hobby minutes for the current week
- **THEN** the system stores the weekly record and confirms the save

### Requirement: Bi-weekly allowances can be logged
The system SHALL allow an authenticated participant to record one allowed alcohol drink and one allowed sweet per two-week period within the challenge window.

#### Scenario: Log bi-weekly allowances
- **WHEN** an authenticated participant marks whether they used their alcohol and sweet allowances in the current two-week period
- **THEN** the system stores the record and confirms the save

#### Scenario: Prevent exceeding bi-weekly allowance
- **WHEN** an authenticated participant attempts to record more than one alcohol drink or more than one sweet within the same two-week period
- **THEN** the system rejects the request with a clear error message

### Requirement: Monthly fast can be logged
The system SHALL allow an authenticated participant to record whether they fasted on the last day of a challenge month.

#### Scenario: Log monthly fast
- **WHEN** an authenticated participant marks the monthly fast as complete on the last day of the month
- **THEN** the system stores the record and confirms the save

### Requirement: Sunday reset can be logged
The system SHALL allow an authenticated participant to record Sunday reset tasks on a Sunday within the challenge window.

#### Scenario: Log Sunday reset
- **WHEN** an authenticated participant submits the Sunday reset checklist on a Sunday
- **THEN** the system stores the record and confirms the save

#### Scenario: Reject Sunday reset on non-Sunday
- **WHEN** an authenticated participant attempts to log Sunday reset tasks on a day that is not Sunday
- **THEN** the system rejects the request with a clear error message

### Requirement: Progress entries are idempotent
The system SHALL allow an authenticated participant to update a previously submitted progress entry by submitting a new entry for the same date or period.

#### Scenario: Update a previous daily entry
- **WHEN** an authenticated participant submits a daily form for a date that already has an entry
- **THEN** the system replaces the existing record with the new values and confirms the save
