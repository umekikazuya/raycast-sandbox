# Domain Model Definition – Raycast Prompt Manager

This document aims to organize domain objects and ubiquitous language in the Raycast Prompt Manager, establishing common understanding before implementation.

## 1. Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| Prompt | Executable AI input template that users create and share | Stored in LocalStorage or DynamoDB |
| PromptCategory | Unit for categorizing multiple prompts | |
| LocalPrompt | Prompt stored in local environment | Offline-ready with immediate access |
| OrgPrompt | Prompt shared through DynamoDB across an organization | With organization filtering and access control |
| PromptEvent | Event representing a state change in a Prompt. Forms the foundation of event sourcing | Records operations like creation, updates, deletion |
| EventStore | Storage for domain events | Initially InMemory, later LocalStorage/DynamoDB |

## 2. Entities & Aggregates

### 2.1 `PromptAggregate`
- `id`: PromptId (UUID or CUID)
- `keyword`: PromptKeyword
- `body`: PromptBody
- `category`: PromptCategory
- `type`: 'local' | 'api'
- `createdAt`: Date
- `updatedAt`: Date

### 2.2 `PromptReadModel`
- Optimized read model for queries
- Projected from PromptAggregate
- Used for faster filtering and searching

<!-- To be implemented in v2 -->
<!--
### 2.3 `ExecutionLog`
- `id`: UUID
- `promptId`: string
- `executedBy`: string (userId)
- `executedAt`: datetime
- `result`: string
-->

## 3. Value Objects

### 3.1 `PromptBody`
- value: string
- constraints: Markdown compliant, 5000 characters max

### 3.2 `PromptCategory`
- value: string
- constraints: 50 characters max, alphanumeric + hyphens + underscores only

### 3.3 `PromptKeyword`
- value: string
- constraints: 100 characters max, must be unique

### 3.4 `PromptId`
- value: string (UUID/CUID)
- constraints: valid UUID/CUID format

### 3.5 `UserMeta`
- id: string
- name: string
- org: string[]

## 4. Domain Events

### 4.1 `PromptCreated`
- `id`: PromptId
- `keyword`: PromptKeyword
- `body`: PromptBody
- `category`: PromptCategory
- `type`: PromptType
- `timestamp`: Date

### 4.2 `PromptKeywordChanged`
- `id`: PromptId
- `oldKeyword`: PromptKeyword
- `newKeyword`: PromptKeyword
- `timestamp`: Date

### 4.3 `PromptBodyUpdated`
- `id`: PromptId
- `newBody`: PromptBody
- `timestamp`: Date

### 4.4 `PromptCategoryChanged`
- `id`: PromptId
- `newCategory`: PromptCategory
- `timestamp`: Date

## 5. Domain Services

### 5.1 `PromptFilterService`
- Provides filtering functionality by category and keyword

### 5.2 `PromptExecutionService`
- Manages prompt execution and results

### 5.3 `EventStore`
- Event persistence and retrieval
- Snapshot management (future)

## 6. Domain Rules & Constraints

- `UserMeta` is required when creating an OrgPrompt
- The `keyword` of a Prompt must be unique
- `PromptBody` cannot be empty
- All events are recorded in chronological order and used for state reconstruction

## 7. Future Extensions (v2+)

- `favorite` flag for Prompts
- Evaluation scores for ExecutionLog
- Hierarchical categorization through PromptGroup
- Snapshot generation from event stream

## 8. Deprecated Features (Reference)

The following features were initially planned but are now deprecated:

- **PromptVariable**: Variable substitution in prompts (expressed as `{{name}}` etc.)
- **PromptTags**: Tagging functionality for prompts
