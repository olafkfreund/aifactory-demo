#!/usr/bin/env python3
"""Manual verification of truncate function with various inputs."""

from src.app.text import truncate

print("=" * 70)
print("MANUAL VERIFICATION: truncate(text, limit) function")
print("=" * 70)

# Test 1: Text shorter than limit
print("\n1. Text shorter than limit (should return unchanged)")
result = truncate("hello", 10)
print(f"   Input: 'hello', limit=10")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "hello" and len(result) == 5 else "   ✗ FAIL")

# Test 2: Text equal to limit
print("\n2. Text equal to limit (should return unchanged)")
result = truncate("hello", 5)
print(f"   Input: 'hello', limit=5")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "hello" and len(result) == 5 else "   ✗ FAIL")

# Test 3: Text longer than limit (basic)
print("\n3. Text longer than limit (should truncate with ellipsis)")
result = truncate("hello world", 8)
print(f"   Input: 'hello world', limit=8")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "hello..." and len(result) == 8 else "   ✗ FAIL")

# Test 4: Empty string
print("\n4. Empty string (should return unchanged)")
result = truncate("", 5)
print(f"   Input: '', limit=5")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "" and len(result) == 0 else "   ✗ FAIL")

# Test 5: Limit exactly 3
print("\n5. Limit exactly 3 with longer text (should return '...')")
result = truncate("hello", 3)
print(f"   Input: 'hello', limit=3")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "..." and len(result) == 3 else "   ✗ FAIL")

# Test 6: Invalid limit (< 3)
print("\n6. Invalid limit < 3 (should raise ValueError)")
try:
    result = truncate("hello", 2)
    print(f"   Input: 'hello', limit=2")
    print(f"   ✗ FAIL - Should have raised ValueError")
except ValueError as e:
    print(f"   Input: 'hello', limit=2")
    print(f"   Exception raised: {e}")
    print(f"   ✓ PASS")

# Test 7: Unicode characters
print("\n7. Unicode characters")
result = truncate("café ☕ world", 10)
print(f"   Input: 'café ☕ world', limit=10")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if len(result) == 10 and result.endswith("...") else "   ✗ FAIL")

# Test 8: Emoji characters
print("\n8. Emoji characters")
result = truncate("hello 👋 world of emojis", 15)
print(f"   Input: 'hello 👋 world of emojis', limit=15")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if len(result) == 15 and result.endswith("...") else "   ✗ FAIL")

# Test 9: Special characters
print("\n9. Special characters")
result = truncate("test@#$%^&*()special", 10)
print(f"   Input: 'test@#$%^&*()special', limit=10")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if len(result) == 10 and result.endswith("...") else "   ✗ FAIL")

# Test 10: Whitespace (spaces, tabs, newlines)
print("\n10. Whitespace characters")
text = "  hello  world  test  "
result = truncate(text, 10)
print(f"   Input: '{text}', limit=10")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if len(result) == 10 else "   ✗ FAIL")

# Test 11: Very long text
print("\n11. Very long text (1000 chars)")
long_text = "a" * 1000
result = truncate(long_text, 50)
print(f"   Input: 'a' * 1000, limit=50")
print(f"   Output: '{result[:20]}...(truncated for display)'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if len(result) == 50 and result.endswith("...") else "   ✗ FAIL")

# Test 12: Newline and tab characters
print("\n12. Newline and tab characters")
result = truncate("hello\nworld\ttest", 12)
print(f"   Input: 'hello\\nworld\\ttest', limit=12")
print(f"   Output: '{repr(result)}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if len(result) == 12 and result.endswith("...") else "   ✗ FAIL")

# Test 13: Single character
print("\n13. Single character")
result = truncate("a", 5)
print(f"   Input: 'a', limit=5")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "a" and len(result) == 1 else "   ✗ FAIL")

# Test 14: Text with 4 characters and limit 3
print("\n14. Text with 4 characters and limit 3 (edge case)")
result = truncate("abcd", 3)
print(f"   Input: 'abcd', limit=3")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "..." and len(result) == 3 else "   ✗ FAIL")

# Test 15: Large limit (no truncation)
print("\n15. Large limit (no truncation)")
result = truncate("hello world", 1000)
print(f"   Input: 'hello world', limit=1000")
print(f"   Output: '{result}'")
print(f"   Length: {len(result)}")
print(f"   ✓ PASS" if result == "hello world" and len(result) == 11 else "   ✗ FAIL")

print("\n" + "=" * 70)
print("Manual Verification Complete!")
print("=" * 70)
