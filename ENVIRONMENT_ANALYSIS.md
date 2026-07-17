# S1_2: Python Environment and Testing Framework Analysis

## Python Version

**Required Version:** Python >= 3.10
**Source:** `pyproject.toml` - `requires-python = ">=3.10"`

### Version Compatibility
- Project requires Python 3.10 or later
- Modern type hints (like `dict[str, str]` instead of `Dict[str, str]`) are used
- All code follows Python 3.10+ conventions

---

## Testing Framework

### Primary Framework: pytest

**Version:** pytest >= 8
**Source:** `pyproject.toml` - optional-dependencies.test

### Installation
```bash
pip install -e ".[test]"  # Install with test dependencies
```

### Test Discovery
- Test files located in `tests/` directory
- Test file naming: `test_*.py`
- Test classes: Capitalized names like `TestFunctionName`
- Test methods: Start with `test_` prefix

### Test Execution
```bash
pytest                 # Run all tests
pytest tests/         # Run all tests in tests directory
pytest -v            # Verbose output
```

---

## Code Patterns

### 1. Pure Function Pattern

**Location:** `src/app/*.py`

**Characteristics:**
- Single responsibility functions
- No side effects
- Deterministic (same input → same output)
- No external dependencies (only standard library)

**Example Structure:**
```python
"""module_name: One-line description of what the function does."""


def function_name(arg: str) -> ReturnType:
    """
    One-line summary of function behavior.

    Args:
        arg: Argument description

    Returns:
        Description of return value

    Examples:
        >>> function_name("input")
        'output'
    """
    # Implementation
    pass
```

### 2. Type Hints

**Pattern:**
- All function parameters have type hints
- All function return types are specified
- Use modern Python 3.10+ syntax (`dict[str, str]` instead of `Dict[str, str]`)
- Use `->` notation for return types

**Examples from project:**
- `def word_reverse(text: str) -> str:`
- `def vowel_count(text: str) -> int:`
- `def dedupe_spaces(text: str) -> str:`

### 3. Module Docstrings

**Pattern:**
- First line in file: triple-quoted docstring
- Format: `"""module_name: Brief description."""`

**Examples:**
```python
"""word_reverse: Reverse characters of each whitespace-separated word."""
"""vowel_count: Count vowels in text (aeiou, case-insensitive)."""
"""dedupe_spaces: Collapse runs of whitespace to single space."""
```

### 4. Function Docstrings

**Pattern:**
- Summary line
- Args section (with type info and description)
- Returns section (with type info and description)
- Examples section with doctest-style examples

**Example:**
```python
def word_reverse(text: str) -> str:
    """
    Reverse the characters of each whitespace-separated word.

    Args:
        text: Input text string

    Returns:
        String with each word's characters reversed

    Examples:
        >>> word_reverse("abc def")
        'cba fed'
    """
```

### 5. Test File Pattern

**Location:** `tests/test_*.py`

**Structure:**
- Module docstring: `"""Tests for module_name module."""`
- Class-based tests with `TestClassName` naming
- Test methods as instance methods with `self` parameter
- Return type hints: `-> None`
- Individual docstrings for each test method

**Example:**
```python
"""Tests for word_reverse module."""

import pytest

from src.app.word_reverse import word_reverse


class TestWordReverse:
    """Test suite for word_reverse function."""

    def test_basic_case(self) -> None:
        """Test basic case description."""
        assert word_reverse("abc def") == "cba fed"
```

### 6. Test Method Naming

**Convention:**
- `test_<description>` format
- Descriptive names that explain what's being tested
- Examples:
  - `test_empty_string()`
  - `test_single_word()`
  - `test_multiple_words()`
  - `test_special_characters()`
  - `test_edge_cases()`

### 7. Test Organization

**Pattern:**
- One test class per function module
- Group related test cases together
- Cover edge cases:
  - Empty inputs
  - Single element
  - Multiple elements
  - Special characters
  - Boundary conditions

### 8. Imports Pattern

**Module Imports:**
- Modules are completely independent
- Only imports from standard library
- No cross-imports between the three modules
- No external dependencies beyond FastAPI/uvicorn for main app

**Test Imports:**
```python
import pytest
from src.app.module_name import function_name
```

---

## Project Configuration

### pyproject.toml Settings
- **Project name:** aifactory-demo
- **Version:** 0.1.0
- **Build system:** hatchling
- **Main dependencies:**
  - fastapi >= 0.115
  - uvicorn[standard] >= 0.32
- **Test dependencies:**
  - pytest >= 8
  - httpx >= 0.27

### Project Structure
```
aifactory-demo/
├── src/
│   └── app/
│       ├── __init__.py         (Version info)
│       ├── main.py             (FastAPI app)
│       ├── word_reverse.py      (Pure function module)
│       ├── vowel_count.py       (Pure function module)
│       └── dedupe_spaces.py     (Pure function module)
├── tests/
│       ├── test_root.py         (FastAPI tests)
│       ├── test_word_reverse.py (Function tests)
│       ├── test_vowel_count.py  (Function tests)
│       └── test_dedupe_spaces.py (Function tests)
└── pyproject.toml              (Project configuration)
```

---

## Code Style Standards

### Formatting
- Use standard Python formatting (implied PEP 8)
- 4-space indentation
- Type hints on all functions
- Docstrings on all modules and functions

### Naming Conventions
- **Functions:** `snake_case`
- **Classes:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE` (if any)
- **Modules:** `snake_case`
- **Test files:** `test_module_name.py`
- **Test classes:** `Test<FunctionName>`
- **Test methods:** `test_<description>`

### Code Quality
- Pure functions only (no side effects)
- No print/debug statements (use logging if needed)
- Comprehensive docstrings
- Full test coverage for edge cases
- No external dependencies for core modules

---

## Verification Checklist

✓ Python version requirement: >= 3.10
✓ Testing framework: pytest >= 8  
✓ Code patterns: Pure functions with type hints and docstrings
✓ Test patterns: Class-based pytest tests with comprehensive coverage
✓ Module independence: No cross-imports between modules
✓ Documentation: Module and function docstrings present
✓ Project configuration: Properly configured in pyproject.toml
