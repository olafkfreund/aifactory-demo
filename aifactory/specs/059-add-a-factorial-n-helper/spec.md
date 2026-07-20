# Task 059: Add a Factorial(n) Helper

## Description

Implement a factorial helper function and expose it via a FastAPI endpoint for the aifactory-demo service.

## Requirements

1. Create a `factorial(n: int) -> int` helper function in `src/app/helpers.py`
2. Implement factorial logic with proper error handling for negative numbers
3. Expose factorial calculation via GET `/factorial/{n}` endpoint in `src/app/main.py`
4. Return results as JSON: `{"factorial": <result>}`
5. Handle negative inputs with HTTP 400 error response
6. Include comprehensive test coverage

## Acceptance Criteria

- ✅ `factorial()` helper function exists and works correctly
- ✅ `/factorial/{n}` endpoint returns correct factorial values
- ✅ Negative input handling with appropriate error messages
- ✅ All test cases pass (unit and integration tests)
- ✅ Code follows project conventions and patterns

## Implementation Status

**Phase:** Complete
**Subtasks:**
- C1: Planning & Design ✅
- C2: Testing Framework Setup ✅
- C3: Implementation ✅
